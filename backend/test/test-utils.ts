import { Role } from '@prisma/client';

// Mock PrismaService — returns jest mocks for all model methods
export function createMockPrismaService() {
  const modelMethods = [
    'findUnique',
    'findFirst',
    'findMany',
    'create',
    'update',
    'updateMany',
    'delete',
    'count',
    'upsert',
  ];
  const models = [
    'profile',
    'customer',
    'customerUser',
    'logisticsJob',
    'exportDeclaration',
    'declarationItem',
    'billingItem',
    'billingInvoice',
    'invoice',
    'notification',
    'refreshToken',
    'jobStatusHistory',
    'approvalLog',
  ];

  const mock: any = {};
  for (const model of models) {
    mock[model] = {};
    for (const method of modelMethods) {
      mock[model][method] = jest.fn();
    }
  }
  mock.$transaction = jest.fn((fns) => {
    if (typeof fns === 'function') return fns(mock);
    return Promise.all(fns);
  });
  mock.$queryRaw = jest.fn().mockResolvedValue([]);
  return mock;
}

// Mock JwtService
export function createMockJwtService() {
  return {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
    verify: jest.fn(),
  };
}

// Mock ConfigService
export function createMockConfigService(overrides: Record<string, any> = {}) {
  const defaults: Record<string, string> = {
    JWT_SECRET: 'test-secret-key-at-least-32-chars-long',
    SUPABASE_URL: 'http://localhost:54321',
    SUPABASE_SERVICE_ROLE_KEY: 'test-key',
    ENCRYPTION_KEY: 'test-encryption-key-32-chars!!!',
    NSW_MAX_RETRIES: '3',
  };
  const values = { ...defaults, ...overrides };
  return {
    get: jest.fn((key: string) => values[key]),
  };
}

// Mock AuditService
export function createMockAuditService() {
  return {
    log: jest.fn(),
  };
}

// Mock BillingService
export function createMockBillingService() {
  return {
    createBillingItemForJob: jest.fn().mockResolvedValue(undefined),
    listItems: jest.fn(),
    createInvoice: jest.fn(),
    updateInvoiceStatus: jest.fn(),
  };
}

// Mock NotificationsService
export function createMockNotificationsService() {
  return {
    create: jest.fn().mockResolvedValue(undefined),
    notifyInternalStaff: jest.fn().mockResolvedValue(undefined),
    notifyCustomerUsers: jest.fn().mockResolvedValue(undefined),
  };
}

// Test data factories
export function createTestProfile(overrides: Record<string, any> = {}) {
  return {
    id: 'user-1',
    email: 'test@example.com',
    fullName: 'Test User',
    ...overrides,
  };
}

export function createTestCustomer(overrides: Record<string, any> = {}) {
  return {
    id: 'cust-1',
    code: 'TEST',
    companyNameTh: 'บริษัท ทดสอบ จำกัด',
    companyNameEn: 'Test Co., Ltd.',
    taxId: '0105561000123',
    status: 'ACTIVE',
    pricePerJob: 500,
    ...overrides,
  };
}

export function createTestJob(overrides: Record<string, any> = {}) {
  return {
    id: 'job-1',
    customerId: 'cust-1',
    jobNo: 'JOB-2026-0001',
    type: 'EXPORT',
    status: 'DRAFT',
    vesselName: 'Test Vessel',
    totalFobUsd: 10000,
    createdById: 'user-1',
    createdAt: new Date('2026-03-01'),
    ...overrides,
  };
}

export function createTestRequestUser(overrides: Record<string, any> = {}) {
  return {
    userId: 'user-1',
    email: 'test@example.com',
    role: Role.SUPER_ADMIN,
    customerId: 'cust-1',
    ...overrides,
  };
}
