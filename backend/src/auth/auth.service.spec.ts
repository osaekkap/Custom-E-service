import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  createMockPrismaService,
  createMockJwtService,
  createMockConfigService,
  createMockAuditService,
  createTestProfile,
  createTestCustomer,
} from '../../test/test-utils';

// Mock createClient from supabase before importing AuthService
const mockSupabaseAuth = {
  signInWithPassword: jest.fn(),
  admin: {
    createUser: jest.fn(),
    updateUserById: jest.fn(),
    deleteUser: jest.fn(),
  },
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: mockSupabaseAuth,
    storage: { from: jest.fn() },
  })),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let jwtService: ReturnType<typeof createMockJwtService>;
  let auditService: ReturnType<typeof createMockAuditService>;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    jwtService = createMockJwtService();
    auditService = createMockAuditService();
    const configService = createMockConfigService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Reset all supabase mocks
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };

    it('should return access_token and user on successful login', async () => {
      const supabaseUser = { id: 'user-1', email: 'test@example.com' };
      const profile = createTestProfile();
      const customer = createTestCustomer();
      const customerUser = {
        role: 'CUSTOMER_ADMIN',
        customerId: 'cust-1',
        customer: { id: customer.id, code: customer.code, companyNameTh: customer.companyNameTh, status: 'ACTIVE' },
      };

      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: supabaseUser },
        error: null,
      });
      prisma.customerUser.findFirst.mockResolvedValue(customerUser);
      prisma.profile.findUnique.mockResolvedValue(profile);

      const result = await service.login(loginDto);

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.role).toBe('CUSTOMER_ADMIN');
      expect(result.user.customer).toEqual(customerUser.customer);
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'user-1',
          email: 'test@example.com',
          role: 'CUSTOMER_ADMIN',
          customer_id: 'cust-1',
        }),
      );
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' },
      });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'LOGIN',
          status: 'FAILED',
        }),
      );
    });

    it('should throw UnauthorizedException when customer is suspended', async () => {
      const supabaseUser = { id: 'user-1', email: 'test@example.com' };
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: supabaseUser },
        error: null,
      });
      prisma.customerUser.findFirst.mockResolvedValue({
        role: 'CUSTOMER_ADMIN',
        customerId: 'cust-1',
        customer: { id: 'cust-1', code: 'TEST', companyNameTh: 'Test', status: 'SUSPENDED' },
      });
      prisma.profile.findUnique.mockResolvedValue(createTestProfile());

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getMe', () => {
    it('should return user profile for valid userId', async () => {
      const profile = createTestProfile();
      const customerUser = {
        role: 'CUSTOMER_ADMIN',
        customer: { id: 'cust-1', code: 'TEST', companyNameTh: 'Test Co.' },
      };

      prisma.profile.findUnique.mockResolvedValue(profile);
      prisma.customerUser.findFirst.mockResolvedValue(customerUser);

      const result = await service.getMe('user-1', 'cust-1');

      expect(result.id).toBe('user-1');
      expect(result.email).toBe('test@example.com');
      expect(result.role).toBe('CUSTOMER_ADMIN');
      expect(result.customer).toEqual(customerUser.customer);
    });

    it('should throw NotFoundException for invalid userId', async () => {
      prisma.profile.findUnique.mockResolvedValue(null);

      await expect(service.getMe('invalid-id', null)).rejects.toThrow(NotFoundException);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const profile = createTestProfile();
      prisma.profile.findUnique.mockResolvedValue(profile);
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });
      mockSupabaseAuth.admin.updateUserById.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const result = await service.changePassword('user-1', 'oldPass', 'newPass');

      expect(result.message).toBe('Password changed successfully');
      expect(mockSupabaseAuth.admin.updateUserById).toHaveBeenCalledWith('user-1', {
        password: 'newPass',
      });
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CHANGE_PASSWORD',
          status: 'SUCCESS',
        }),
      );
    });

    it('should throw UnauthorizedException if current password is wrong', async () => {
      const profile = createTestProfile();
      prisma.profile.findUnique.mockResolvedValue(profile);
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' },
      });

      await expect(
        service.changePassword('user-1', 'wrongPass', 'newPass'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
