import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { QueryJobDto } from './dto/query-job.dto';
import { JobStatus, Role, Prisma } from '@prisma/client';
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
  constructor(
    private prisma: PrismaService,
    private billingService: BillingService,
  ) {}

  /** POST /jobs */
  async create(dto: CreateJobDto, user: RequestUser) {
    // SUPER_ADMIN may supply customerId in body; regular users use their own
    const customerId = (user.role === Role.SUPER_ADMIN && dto.customerId)
      ? dto.customerId
      : user.customerId;
    if (!customerId) throw new ForbiddenException('No customer context');

    // Generate jobNo: JOB-YYYY-NNNN
    const jobNo = await this.generateJobNo();

    const job = await this.prisma.logisticsJob.create({
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

    // Record initial status history
    await this.prisma.jobStatusHistory.create({
      data: {
        jobId: job.id,
        toStatus: JobStatus.DRAFT,
        changedBy: user.userId,
        note: 'Job created',
      },
    });

    return job;
  }

  /** GET /jobs */
  async findAll(query: QueryJobDto, user: RequestUser) {
    const { status, type, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    // SUPER_ADMIN or internal staff (no customerId) → see all jobs, optionally filter by customerId
    // CUSTOMER / tenant-scoped users → see only their customer's jobs
    const isInternalStaff =
      user.role === Role.SUPER_ADMIN ||
      (user.customerId == null &&
        ([Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF] as string[]).includes(user.role));

    const customerFilter = isInternalStaff
      ? query.customerId ? { customerId: query.customerId } : {}
      : { customerId: user.customerId };

    const where: Prisma.LogisticsJobWhereInput = {
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
      await this.billingService.createBillingItemForJob(id).catch(() => null);
    }

    return updated;
  }

  /** DELETE /jobs/:id — soft delete only if DRAFT */
  async remove(id: string, user: RequestUser) {
    const job = await this.assertJobExists(id, user);

    if (job.status !== JobStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT jobs can be deleted');
    }

    await this.prisma.logisticsJob.delete({ where: { id } });
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

  private async generateJobNo(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `JOB-${year}-`;

    const last = await this.prisma.logisticsJob.findFirst({
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
    // Internal staff (TENANT_ADMIN, MANAGER, STAFF) without customerId can access all jobs
    if (
      user.customerId == null &&
      ([Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF] as string[]).includes(user.role)
    ) return;
    if (user.customerId !== jobCustomerId) throw new ForbiddenException('Access denied');
  }
}
