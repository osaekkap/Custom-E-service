import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { BillingService } from './billing.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  createMockPrismaService,
  createTestJob,
  createTestCustomer,
  createTestRequestUser,
} from '../../test/test-utils';
import { Role, JobStatus, InvoiceStatus } from '@prisma/client';

describe('BillingService', () => {
  let service: BillingService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    jest.clearAllMocks();
  });

  describe('createBillingItemForJob', () => {
    it('should create a billing item for a completed job', async () => {
      const customer = createTestCustomer({ pricePerJob: 750 });
      const job = createTestJob({ status: JobStatus.COMPLETED, customer });

      prisma.logisticsJob.findUnique.mockResolvedValue(job);
      prisma.billingItem.findUnique.mockResolvedValue(null); // no existing item
      prisma.billingItem.create.mockResolvedValue({
        id: 'bill-1',
        customerId: 'cust-1',
        jobId: 'job-1',
        amount: 750,
      });

      const result = await service.createBillingItemForJob('job-1');

      expect(result.amount).toBe(750);
      expect(prisma.billingItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            customerId: 'cust-1',
            jobId: 'job-1',
            amount: 750,
          }),
        }),
      );
    });

    it('should return existing item if already created (idempotent)', async () => {
      const customer = createTestCustomer();
      const job = createTestJob({ status: JobStatus.COMPLETED, customer });
      const existingItem = { id: 'bill-1', jobId: 'job-1', amount: 500 };

      prisma.logisticsJob.findUnique.mockResolvedValue(job);
      prisma.billingItem.findUnique.mockResolvedValue(existingItem);

      const result = await service.createBillingItemForJob('job-1');

      expect(result).toEqual(existingItem);
      expect(prisma.billingItem.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent job', async () => {
      prisma.logisticsJob.findUnique.mockResolvedValue(null);

      await expect(service.createBillingItemForJob('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if job is not COMPLETED', async () => {
      const customer = createTestCustomer();
      const job = createTestJob({ status: 'DRAFT', customer });
      prisma.logisticsJob.findUnique.mockResolvedValue(job);

      await expect(service.createBillingItemForJob('job-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('listItems', () => {
    it('should return all billing items for internal staff', async () => {
      const user = createTestRequestUser({ role: Role.SUPER_ADMIN, customerId: null });
      const items = [
        { id: 'bill-1', amount: 500 },
        { id: 'bill-2', amount: 750 },
      ];
      prisma.billingItem.findMany.mockResolvedValue(items);

      const result = await service.listItems(user);

      expect(result).toHaveLength(2);
      expect(prisma.billingItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({ customerId: expect.anything() }),
        }),
      );
    });

    it('should filter by customerId for customer users', async () => {
      const user = createTestRequestUser({ role: Role.CUSTOMER_ADMIN, customerId: 'cust-1' });
      prisma.billingItem.findMany.mockResolvedValue([{ id: 'bill-1', amount: 500 }]);

      await service.listItems(user);

      expect(prisma.billingItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ customerId: 'cust-1' }),
        }),
      );
    });
  });

  describe('createInvoice', () => {
    it('should create an invoice from billing items', async () => {
      const user = createTestRequestUser({ role: Role.SUPER_ADMIN });
      const dto = {
        customerId: 'cust-1',
        billingItemIds: ['bill-1', 'bill-2'],
      };
      const items = [
        { id: 'bill-1', amount: 500, customerId: 'cust-1', isInvoiced: false },
        { id: 'bill-2', amount: 750, customerId: 'cust-1', isInvoiced: false },
      ];

      prisma.billingItem.findMany.mockResolvedValue(items);
      prisma.$transaction.mockImplementation(async (fn: any) => {
        if (typeof fn === 'function') return fn(prisma);
        return Promise.all(fn);
      });
      prisma.billingInvoice.findFirst.mockResolvedValue(null); // no existing invoices
      prisma.billingInvoice.create.mockResolvedValue({
        id: 'inv-1',
        invoiceNo: 'INV-2026-0001',
        customerId: 'cust-1',
        totalAmount: 1250,
      });
      prisma.billingItem.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.createInvoice(dto as any, user);

      expect(result.totalAmount).toBe(1250);
      expect(result.invoiceNo).toBe('INV-2026-0001');
    });

    it('should throw ForbiddenException for non-SUPER_ADMIN', async () => {
      const user = createTestRequestUser({ role: Role.CUSTOMER_ADMIN });
      const dto = { customerId: 'cust-1', billingItemIds: ['bill-1'] };

      await expect(service.createInvoice(dto as any, user)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException when no uninvoiced items found', async () => {
      const user = createTestRequestUser({ role: Role.SUPER_ADMIN });
      const dto = { customerId: 'cust-1', billingItemIds: ['bill-1'] };

      prisma.billingItem.findMany.mockResolvedValue([]);

      await expect(service.createInvoice(dto as any, user)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateInvoiceStatus', () => {
    it('should update invoice status to PAID', async () => {
      const user = createTestRequestUser({ role: Role.SUPER_ADMIN });
      const invoice = { id: 'inv-1', status: 'DRAFT', customerId: 'cust-1' };
      const updatedInvoice = { ...invoice, status: InvoiceStatus.PAID, paidAt: expect.any(Date) };

      prisma.billingInvoice.findUnique.mockResolvedValue(invoice);
      prisma.billingInvoice.update.mockResolvedValue(updatedInvoice);

      const result = await service.updateInvoiceStatus(
        'inv-1',
        { status: InvoiceStatus.PAID } as any,
        user,
      );

      expect(result.status).toBe(InvoiceStatus.PAID);
    });

    it('should throw ForbiddenException for non-SUPER_ADMIN', async () => {
      const user = createTestRequestUser({ role: Role.CUSTOMER_ADMIN });

      await expect(
        service.updateInvoiceStatus('inv-1', { status: InvoiceStatus.PAID } as any, user),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for non-existent invoice', async () => {
      const user = createTestRequestUser({ role: Role.SUPER_ADMIN });
      prisma.billingInvoice.findUnique.mockResolvedValue(null);

      await expect(
        service.updateInvoiceStatus('nonexistent', { status: InvoiceStatus.PAID } as any, user),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
