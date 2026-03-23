import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from './dto/billing.dto';
import { BillingItemType, InvoiceStatus, JobStatus, Role } from '@prisma/client';
import { RequestUser } from '../auth/jwt.strategy';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  /** สร้าง BillingItem อัตโนมัติเมื่อ Job เสร็จสิ้น (COMPLETED) */
  async createBillingItemForJob(jobId: string) {
    const job = await this.prisma.logisticsJob.findUnique({
      where: { id: jobId },
      include: { customer: true },
    });
    if (!job) throw new NotFoundException(`Job ${jobId} not found`);
    if (job.status !== JobStatus.COMPLETED) {
      throw new BadRequestException('Job must be COMPLETED to create billing item');
    }

    const existing = await this.prisma.billingItem.findUnique({ where: { jobId } });
    if (existing) return existing; // idempotent

    const amount = job.customer.pricePerJob ?? 500; // default 500 THB

    return this.prisma.billingItem.create({
      data: {
        customerId: job.customerId,
        jobId,
        type: BillingItemType.DECLARATION_FEE,
        amount,
        currency: 'THB',
      },
    });
  }

  /** GET /billing/items?customerId=&invoiced= — รายการ billing items */
  async listItems(user: RequestUser, invoiced?: string) {
    const isInvoiced = invoiced === 'true' ? true : invoiced === 'false' ? false : undefined;
    const customerFilter = user.role === Role.SUPER_ADMIN ? {} : { customerId: user.customerId };

    return this.prisma.billingItem.findMany({
      where: {
        ...customerFilter,
        ...(isInvoiced !== undefined && { isInvoiced }),
      },
      include: {
        job: { select: { jobNo: true, type: true, status: true } },
        customer: { select: { id: true, code: true, companyNameTh: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** POST /billing/invoices — สร้าง invoice รวม billing items */
  async createInvoice(dto: CreateInvoiceDto, user: RequestUser) {
    if (user.role !== Role.SUPER_ADMIN) throw new ForbiddenException('SUPER_ADMIN only');

    const items = await this.prisma.billingItem.findMany({
      where: {
        id: { in: dto.billingItemIds },
        customerId: dto.customerId,
        isInvoiced: false,
      },
    });

    if (items.length === 0) throw new BadRequestException('No uninvoiced billing items found');
    if (items.length !== dto.billingItemIds.length) {
      throw new BadRequestException('Some items not found or already invoiced');
    }

    const totalAmount = items.reduce((sum, item) => sum + Number(item.amount), 0);
    const invoiceNo = await this.generateInvoiceNo();

    const invoice = await this.prisma.$transaction(async (tx) => {
      const inv = await tx.billingInvoice.create({
        data: {
          customerId: dto.customerId,
          invoiceNo,
          totalAmount,
          currency: 'THB',
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          periodStart: dto.periodStart ? new Date(dto.periodStart) : undefined,
          periodEnd: dto.periodEnd ? new Date(dto.periodEnd) : undefined,
          note: dto.note,
        },
      });

      await tx.billingItem.updateMany({
        where: { id: { in: dto.billingItemIds } },
        data: { isInvoiced: true, invoiceId: inv.id },
      });

      return inv;
    });

    return invoice;
  }

  /** GET /billing/invoices — รายการ invoices */
  async listInvoices(user: RequestUser, customerId?: string) {
    const customerFilter =
      user.role === Role.SUPER_ADMIN
        ? customerId ? { customerId } : {}
        : { customerId: user.customerId };

    return this.prisma.billingInvoice.findMany({
      where: customerFilter,
      include: {
        customer: { select: { id: true, code: true, companyNameTh: true } },
        items: { select: { id: true, type: true, amount: true, jobId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** GET /billing/invoices/:id */
  async findInvoice(id: string, user: RequestUser) {
    const invoice = await this.prisma.billingInvoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: { job: { select: { jobNo: true, type: true } } },
        },
      },
    });
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    if (user.role !== Role.SUPER_ADMIN && invoice.customerId !== user.customerId) {
      throw new ForbiddenException('Access denied');
    }
    return invoice;
  }

  /** PATCH /billing/invoices/:id/status */
  async updateInvoiceStatus(id: string, dto: UpdateInvoiceStatusDto, user: RequestUser) {
    if (user.role !== Role.SUPER_ADMIN) throw new ForbiddenException('SUPER_ADMIN only');
    const invoice = await this.prisma.billingInvoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);

    return this.prisma.billingInvoice.update({
      where: { id },
      data: {
        status: dto.status,
        paidAt: dto.status === InvoiceStatus.PAID
          ? (dto.paidAt ? new Date(dto.paidAt) : new Date())
          : undefined,
      },
    });
  }

  private async generateInvoiceNo(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;
    const last = await this.prisma.billingInvoice.findFirst({
      where: { invoiceNo: { startsWith: prefix } },
      orderBy: { invoiceNo: 'desc' },
    });
    const seq = last ? parseInt(last.invoiceNo.split('-')[2], 10) + 1 : 1;
    return `${prefix}${String(seq).padStart(4, '0')}`;
  }
}
