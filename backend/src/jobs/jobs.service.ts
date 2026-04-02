import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { QueryJobDto } from './dto/query-job.dto';
import { JobStatus, Role, ApprovalStatus, NotificationType, Prisma } from '@prisma/client';
import { RequestUser } from '../auth/jwt.strategy';

// Valid status transitions
const STATUS_TRANSITIONS: Partial<Record<JobStatus, JobStatus[]>> = {
  [JobStatus.DRAFT]:           [JobStatus.PREPARING],
  [JobStatus.PREPARING]:       [JobStatus.READY, JobStatus.DRAFT],
  [JobStatus.READY]:           [JobStatus.GENERATING, JobStatus.PREPARING],
  [JobStatus.GENERATING]:      [JobStatus.READY_TO_SUBMIT, JobStatus.READY],
  [JobStatus.READY_TO_SUBMIT]: [JobStatus.SUBMITTING, JobStatus.READY],
  [JobStatus.SUBMITTING]:      [JobStatus.SUBMITTED, JobStatus.READY_TO_SUBMIT],
  [JobStatus.SUBMITTED]:       [JobStatus.NSW_PROCESSING, JobStatus.REJECTED],
  [JobStatus.NSW_PROCESSING]:  [JobStatus.CUSTOMS_REVIEW, JobStatus.REJECTED],
  [JobStatus.CUSTOMS_REVIEW]:  [JobStatus.CLEARED, JobStatus.REJECTED],
  [JobStatus.CLEARED]:         [JobStatus.COMPLETED],
  [JobStatus.REJECTED]:        [JobStatus.DRAFT],
};

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private prisma: PrismaService,
    private billingService: BillingService,
    private notificationsService: NotificationsService,
  ) {}

  /** POST /jobs */
  async create(dto: CreateJobDto, user: RequestUser) {
    const customerId = (user.role === Role.SUPER_ADMIN && dto.customerId)
      ? dto.customerId
      : user.customerId;
    if (!customerId) throw new ForbiddenException('No customer context');

    // Serializable transaction prevents duplicate job numbers under concurrent requests
    const job = await this.prisma.$transaction(async (tx) => {
      const jobNo = await this.generateJobNo(tx);

      const created = await tx.logisticsJob.create({
        data: {
          customerId,
          jobNo,
          type: dto.type,
          transportMode: dto.transportMode,
          vesselName: dto.vesselName,
          voyageNo: dto.voyageNo,
          etd: dto.etd ? new Date(dto.etd) : undefined,
          eta: dto.eta ? new Date(dto.eta) : undefined,
          portOfLoading: dto.portOfLoading,
          portOfLoadingCode: dto.portOfLoadingCode,
          portOfDischarge: dto.portOfDischarge,
          portOfReleaseCode: dto.portOfReleaseCode,
          containerNo: dto.containerNo,
          sealNo: dto.sealNo,
          consigneeId: dto.consigneeId,
          consigneeNameEn: dto.consigneeNameEn,
          consigneeAddr: dto.consigneeAddr,
          totalFobUsd: dto.totalFobUsd,
          currency: dto.currency ?? 'USD',
          createdById: user.userId,
        },
      });

      await tx.jobStatusHistory.create({
        data: {
          jobId: created.id,
          toStatus: JobStatus.DRAFT,
          changedBy: user.userId,
          note: 'Job created',
        },
      });

      return created;
    }, { isolationLevel: 'Serializable' });

    // C2: Notify internal staff when customer creates shipment
    const isCustomerSide = ([Role.CUSTOMER_ADMIN, Role.CUSTOMER] as string[]).includes(user.role);
    if (isCustomerSide) {
      this.notificationsService.notifyInternalStaff({
        type: NotificationType.JOB_CREATED,
        title: `Shipment ใหม่: ${job.jobNo}`,
        message: `ลูกค้าสร้าง shipment ใหม่ ${job.jobNo}`,
        entityType: 'JOB',
        entityId: job.id,
      }).catch(err => this.logger.error('Failed to notify staff on job creation', err));
    }

    return job;
  }

  /** GET /jobs */
  async findAll(query: QueryJobDto, user: RequestUser) {
    const { status, type, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const isInternalStaff =
      user.role === Role.SUPER_ADMIN ||
      (user.customerId == null &&
        ([Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF] as string[]).includes(user.role));

    const customerFilter = isInternalStaff
      ? query.customerId ? { customerId: query.customerId } : {}
      : { customerId: user.customerId };

    const where: Prisma.LogisticsJobWhereInput = {
      deletedAt: null,
      ...customerFilter,
      ...(status && { status }),
      ...(type && { type }),
      ...(search && {
        OR: [
          { jobNo: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { vesselName: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { containerNo: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.logisticsJob.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          jobNo: true,
          type: true,
          status: true,
          transportMode: true,
          vesselName: true,
          voyageNo: true,
          etd: true,
          portOfLoading: true,
          portOfDischarge: true,
          totalFobUsd: true,
          currency: true,
          assignedToId: true,
          approvalStatus: true,
          createdAt: true,
          customer: { select: { id: true, code: true, companyNameTh: true } },
          _count: { select: { documents: true, declarations: true } },
        },
      }),
      this.prisma.logisticsJob.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** GET /jobs/:id */
  async findOne(id: string, user: RequestUser) {
    const job = await this.prisma.logisticsJob.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, code: true, companyNameTh: true } },
        consignee: true,
        documents: { orderBy: { createdAt: 'asc' } },
        declarations: { select: { id: true, declarationNo: true, declarationType: true, createdAt: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        approvalLogs: { orderBy: { createdAt: 'asc' } },
        _count: { select: { documents: true, declarations: true } },
      },
    });

    if (!job) throw new NotFoundException(`Job ${id} not found`);
    this.assertAccess(job.customerId, user);
    return job;
  }

  /** PATCH /jobs/:id */
  async update(id: string, dto: UpdateJobDto, user: RequestUser) {
    const job = await this.assertJobExists(id, user);

    if (job.status !== JobStatus.DRAFT && job.status !== JobStatus.PREPARING) {
      throw new BadRequestException('Can only edit jobs in DRAFT or PREPARING status');
    }

    return this.prisma.logisticsJob.update({
      where: { id },
      data: {
        ...(dto.type && { type: dto.type }),
        ...(dto.transportMode && { transportMode: dto.transportMode }),
        ...(dto.vesselName !== undefined && { vesselName: dto.vesselName }),
        ...(dto.voyageNo !== undefined && { voyageNo: dto.voyageNo }),
        ...(dto.etd && { etd: new Date(dto.etd) }),
        ...(dto.eta && { eta: new Date(dto.eta) }),
        ...(dto.portOfLoading !== undefined && { portOfLoading: dto.portOfLoading }),
        ...(dto.portOfLoadingCode !== undefined && { portOfLoadingCode: dto.portOfLoadingCode }),
        ...(dto.portOfDischarge !== undefined && { portOfDischarge: dto.portOfDischarge }),
        ...(dto.portOfReleaseCode !== undefined && { portOfReleaseCode: dto.portOfReleaseCode }),
        ...(dto.containerNo !== undefined && { containerNo: dto.containerNo }),
        ...(dto.sealNo !== undefined && { sealNo: dto.sealNo }),
        ...(dto.consigneeId !== undefined && { consigneeId: dto.consigneeId }),
        ...(dto.consigneeNameEn !== undefined && { consigneeNameEn: dto.consigneeNameEn }),
        ...(dto.consigneeAddr !== undefined && { consigneeAddr: dto.consigneeAddr }),
        ...(dto.totalFobUsd !== undefined && { totalFobUsd: dto.totalFobUsd }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
      },
    });
  }

  /** PATCH /jobs/:id/status */
  async updateStatus(id: string, dto: UpdateJobStatusDto, user: RequestUser) {
    const job = await this.assertJobExists(id, user);

    const allowed = STATUS_TRANSITIONS[job.status] ?? [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${job.status} to ${dto.status}. Allowed: ${allowed.join(', ')}`,
      );
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.logisticsJob.update({
        where: { id },
        data: { status: dto.status },
      }),
      this.prisma.jobStatusHistory.create({
        data: {
          jobId: id,
          fromStatus: job.status,
          toStatus: dto.status,
          changedBy: user.userId,
          note: dto.note,
        },
      }),
    ]);

    // Auto-create billing item when job reaches COMPLETED
    if (dto.status === JobStatus.COMPLETED) {
      await this.billingService.createBillingItemForJob(id).catch(err => this.logger.error(`Failed to create billing item for job ${id}`, err));
    }

    // C1: Notify customer when status changes
    this.notificationsService.notifyCustomerUsers(job.customerId, {
      type: NotificationType.JOB_STATUS_CHANGED,
      title: `สถานะ ${job.jobNo} เปลี่ยน`,
      message: `สถานะเปลี่ยนจาก ${job.status} เป็น ${dto.status}`,
      entityType: 'JOB',
      entityId: id,
    }).catch(err => this.logger.error(`Failed to notify customer on status change for job ${id}`, err));

    return updated;
  }

  // ─── B1: Job Assignment ─────────────────────────────────────────

  /** PATCH /jobs/:id/assign */
  async assignJob(id: string, assignToId: string, user: RequestUser) {
    const job = await this.assertJobExists(id, user);

    const updated = await this.prisma.logisticsJob.update({
      where: { id },
      data: {
        assignedToId: assignToId,
        assignedAt: new Date(),
        assignedById: user.userId,
      },
    });

    // Notify the assigned staff
    this.notificationsService.create({
      recipientId: assignToId,
      type: NotificationType.JOB_ASSIGNED,
      title: `มอบหมายงาน: ${job.jobNo}`,
      message: `คุณได้รับมอบหมายให้ดูแล shipment ${job.jobNo}`,
      entityType: 'JOB',
      entityId: id,
    }).catch(err => this.logger.error(`Failed to notify assigned staff for job ${id}`, err));

    return updated;
  }

  // ─── B2: Approval Workflow ──────────────────────────────────────

  /** PATCH /jobs/:id/request-approval */
  async requestApproval(id: string, note: string | undefined, user: RequestUser) {
    const job = await this.assertJobExists(id, user);

    if (job.approvalStatus !== ApprovalStatus.NONE && job.approvalStatus !== ApprovalStatus.REJECTED) {
      throw new BadRequestException(`Cannot request approval when status is ${job.approvalStatus}`);
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.logisticsJob.update({
        where: { id },
        data: {
          approvalStatus: ApprovalStatus.PENDING,
          approvalRequestedAt: new Date(),
          approvalNote: note,
        },
      }),
      this.prisma.approvalLog.create({
        data: {
          jobId: id,
          action: 'REQUEST',
          fromStatus: job.approvalStatus,
          toStatus: ApprovalStatus.PENDING,
          actorId: user.userId,
          note,
        },
      }),
    ]);

    // Notify managers
    this.notificationsService.notifyInternalStaff({
      type: NotificationType.APPROVAL_REQUESTED,
      title: `ขออนุมัติ: ${job.jobNo}`,
      message: `${job.jobNo} ขออนุมัติก่อนส่ง NSW${note ? ` — ${note}` : ''}`,
      entityType: 'JOB',
      entityId: id,
    }).catch(err => this.logger.error(`Failed to notify managers on approval request for job ${id}`, err));

    return updated;
  }

  /** PATCH /jobs/:id/approve */
  async approveJob(id: string, note: string | undefined, user: RequestUser) {
    const job = await this.assertJobExists(id, user);

    if (!([Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER] as string[]).includes(user.role)) {
      throw new ForbiddenException('Only managers can approve jobs');
    }

    if (job.approvalStatus !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Job is not pending approval');
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.logisticsJob.update({
        where: { id },
        data: { approvalStatus: ApprovalStatus.APPROVED, approvalNote: note },
      }),
      this.prisma.approvalLog.create({
        data: {
          jobId: id,
          action: 'APPROVE',
          fromStatus: ApprovalStatus.PENDING,
          toStatus: ApprovalStatus.APPROVED,
          actorId: user.userId,
          note,
        },
      }),
    ]);

    this.notificationsService.create({
      recipientId: job.createdById,
      type: NotificationType.APPROVAL_APPROVED,
      title: `อนุมัติแล้ว: ${job.jobNo}`,
      message: `${job.jobNo} ได้รับการอนุมัติ${note ? ` — ${note}` : ''}`,
      entityType: 'JOB',
      entityId: id,
    }).catch(err => this.logger.error(`Failed to notify creator on job approval for job ${id}`, err));

    return updated;
  }

  /** PATCH /jobs/:id/reject */
  async rejectJob(id: string, note: string | undefined, user: RequestUser) {
    const job = await this.assertJobExists(id, user);

    if (!([Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER] as string[]).includes(user.role)) {
      throw new ForbiddenException('Only managers can reject jobs');
    }

    if (job.approvalStatus !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Job is not pending approval');
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.logisticsJob.update({
        where: { id },
        data: { approvalStatus: ApprovalStatus.REJECTED, approvalNote: note },
      }),
      this.prisma.approvalLog.create({
        data: {
          jobId: id,
          action: 'REJECT',
          fromStatus: ApprovalStatus.PENDING,
          toStatus: ApprovalStatus.REJECTED,
          actorId: user.userId,
          note,
        },
      }),
    ]);

    this.notificationsService.create({
      recipientId: job.createdById,
      type: NotificationType.APPROVAL_REJECTED,
      title: `ถูกปฏิเสธ: ${job.jobNo}`,
      message: `${job.jobNo} ไม่ผ่านการอนุมัติ${note ? ` — ${note}` : ''}`,
      entityType: 'JOB',
      entityId: id,
    }).catch(err => this.logger.error(`Failed to notify creator on job rejection for job ${id}`, err));

    return updated;
  }

  /** DELETE /jobs/:id — soft delete only if DRAFT */
  async remove(id: string, user: RequestUser) {
    const job = await this.assertJobExists(id, user);
    if (job.status !== JobStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT jobs can be deleted');
    }
    await this.prisma.logisticsJob.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { message: `Job ${job.jobNo} deleted` };
  }

  /** GET /jobs/:id/history */
  async getHistory(id: string, user: RequestUser) {
    const job = await this.assertJobExists(id, user);
    return this.prisma.jobStatusHistory.findMany({
      where: { jobId: job.id },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ─── Helpers ────────────────────────────────────────────────────

  private async generateJobNo(tx?: any): Promise<string> {
    const db = tx || this.prisma;
    const year = new Date().getFullYear();
    const prefix = `JOB-${year}-`;
    const last = await db.logisticsJob.findFirst({
      where: { jobNo: { startsWith: prefix } },
      orderBy: { jobNo: 'desc' },
    });
    const seq = last ? parseInt(last.jobNo.split('-')[2], 10) + 1 : 1;
    return `${prefix}${String(seq).padStart(4, '0')}`;
  }

  private async assertJobExists(id: string, user: RequestUser) {
    const job = await this.prisma.logisticsJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException(`Job ${id} not found`);
    this.assertAccess(job.customerId, user);
    return job;
  }

  private assertAccess(jobCustomerId: string, user: RequestUser) {
    if (user.role === Role.SUPER_ADMIN) return;
    if (
      user.customerId == null &&
      ([Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF] as string[]).includes(user.role)
    ) return;
    if (user.customerId !== jobCustomerId) throw new ForbiddenException('Access denied');
  }
}
