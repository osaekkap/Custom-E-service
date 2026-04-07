import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  createMockPrismaService,
  createMockBillingService,
  createMockNotificationsService,
  createTestJob,
  createTestRequestUser,
} from '../../test/test-utils';
import { Role } from '@prisma/client';

describe('JobsService', () => {
  let service: JobsService;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let billingService: ReturnType<typeof createMockBillingService>;
  let notificationsService: ReturnType<typeof createMockNotificationsService>;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    billingService = createMockBillingService();
    notificationsService = createMockNotificationsService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: PrismaService, useValue: prisma },
        { provide: BillingService, useValue: billingService },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a job with correct customerId', async () => {
      const user = createTestRequestUser({ role: Role.SUPER_ADMIN, customerId: null });
      const dto = {
        customerId: 'cust-1',
        type: 'EXPORT',
        vesselName: 'Test Vessel',
      } as any;

      const createdJob = createTestJob();
      // $transaction with function callback — mock returns the job
      prisma.$transaction.mockImplementation(async (fn: any) => {
        if (typeof fn === 'function') return fn(prisma);
        return Promise.all(fn);
      });
      prisma.logisticsJob.findFirst.mockResolvedValue(null); // no existing jobs for job number generation
      prisma.logisticsJob.create.mockResolvedValue(createdJob);
      prisma.jobStatusHistory.create.mockResolvedValue({});

      const result = await service.create(dto, user);

      expect(result).toEqual(createdJob);
      expect(prisma.logisticsJob.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            customerId: 'cust-1',
            type: 'EXPORT',
          }),
        }),
      );
    });

    it('should throw ForbiddenException when no customer context', async () => {
      const user = createTestRequestUser({ role: Role.CUSTOMER_ADMIN, customerId: null });
      const dto = { type: 'EXPORT' } as any;

      await expect(service.create(dto, user)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('should return paginated jobs for internal staff', async () => {
      const user = createTestRequestUser({ role: Role.SUPER_ADMIN, customerId: null });
      const jobs = [createTestJob(), createTestJob({ id: 'job-2', jobNo: 'JOB-2026-0002' })];

      prisma.logisticsJob.findMany.mockResolvedValue(jobs);
      prisma.logisticsJob.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 20 } as any, user);

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
    });

    it('should filter by customerId for customer users', async () => {
      const user = createTestRequestUser({ role: Role.CUSTOMER_ADMIN, customerId: 'cust-1' });
      prisma.logisticsJob.findMany.mockResolvedValue([createTestJob()]);
      prisma.logisticsJob.count.mockResolvedValue(1);

      await service.findAll({ page: 1, limit: 20 } as any, user);

      expect(prisma.logisticsJob.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            customerId: 'cust-1',
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a job by id', async () => {
      const user = createTestRequestUser({ role: Role.SUPER_ADMIN });
      const job = createTestJob();
      prisma.logisticsJob.findUnique.mockResolvedValue(job);

      const result = await service.findOne('job-1', user);

      expect(result.id).toBe('job-1');
      expect(prisma.logisticsJob.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'job-1' } }),
      );
    });

    it('should throw NotFoundException for non-existent job', async () => {
      const user = createTestRequestUser({ role: Role.SUPER_ADMIN });
      prisma.logisticsJob.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', user)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when customer user accesses another customer job', async () => {
      const user = createTestRequestUser({ role: Role.CUSTOMER_ADMIN, customerId: 'cust-2' });
      const job = createTestJob({ customerId: 'cust-1' });
      prisma.logisticsJob.findUnique.mockResolvedValue(job);

      await expect(service.findOne('job-1', user)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateStatus', () => {
    it('should update job status for valid transition', async () => {
      const user = createTestRequestUser({ role: Role.SUPER_ADMIN });
      const job = createTestJob({ status: 'DRAFT' });
      const updatedJob = { ...job, status: 'PREPARING' };

      prisma.logisticsJob.findUnique.mockResolvedValue(job);
      prisma.$transaction.mockResolvedValue([updatedJob, {}]);

      const result = await service.updateStatus('job-1', { status: 'PREPARING' } as any, user);

      expect(result.status).toBe('PREPARING');
    });

    it('should reject invalid status transition', async () => {
      const user = createTestRequestUser({ role: Role.SUPER_ADMIN });
      const job = createTestJob({ status: 'DRAFT' });

      prisma.logisticsJob.findUnique.mockResolvedValue(job);

      await expect(
        service.updateStatus('job-1', { status: 'COMPLETED' } as any, user),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
