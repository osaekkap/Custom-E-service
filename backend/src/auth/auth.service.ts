import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterB2bDto } from './dto/register-b2b.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  private supabase;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private auditService: AuditService,
  ) {
    this.supabase = createClient(
      this.config.get<string>('SUPABASE_URL') ?? '',
      this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
  }

  /** POST /auth/login */
  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    // 1. Verify credentials via Supabase Auth
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });
    if (error || !data.user) {
      // Log failed login attempt
      this.auditService.log({
        actorEmail: dto.email,
        action: 'LOGIN',
        entityType: 'AUTH',
        status: 'FAILED',
        ipAddress,
        userAgent,
        detail: { reason: 'Invalid credentials' },
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    const supabaseUser = data.user;

    // 2. Look up CustomerUser to get role + customerId
    const customerUser = await this.prisma.customerUser.findFirst({
      where: { profileId: supabaseUser.id },
      include: { customer: { select: { id: true, code: true, companyNameTh: true, status: true } } },
    });

    // SUPER_ADMIN has no customerUser row — check Profile directly
    const profile = await this.prisma.profile.findUnique({
      where: { id: supabaseUser.id },
    });

    const role: Role = customerUser?.role ?? Role.SUPER_ADMIN;
    const customerId = customerUser?.customerId ?? null;

    if (customerUser?.customer?.status === 'SUSPENDED') {
      throw new UnauthorizedException('Account suspended');
    }

    // 3. Sign JWT with customer_id injected
    const payload = {
      sub: supabaseUser.id,
      email: supabaseUser.email,
      role,
      customer_id: customerId,
    };
    const token = this.jwtService.sign(payload);

    // Log successful login
    this.auditService.log({
      actorId:    supabaseUser.id,
      actorEmail: supabaseUser.email,
      customerId,
      action:     'LOGIN',
      entityType: 'AUTH',
      status:     'SUCCESS',
      ipAddress,
      userAgent,
      detail: { role, customerCode: customerUser?.customer?.code },
    });

    return {
      access_token: token,
      user: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        fullName: profile?.fullName,
        role,
        customer: customerUser?.customer ?? null,
      },
    };
  }

  /** POST /auth/register — Admin creates user for a customer */
  async register(dto: RegisterDto) {
    // 1. Verify customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer) throw new NotFoundException(`Customer ${dto.customerId} not found`);

    // 2. Create Supabase Auth user
    const { data, error } = await this.supabase.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
      user_metadata: { full_name: dto.fullName },
    });
    if (error) {
      if (error.message.includes('already')) throw new ConflictException('Email already registered');
      throw new UnauthorizedException(error.message);
    }

    const supabaseUser = data.user;

    // 3. Upsert Profile
    await this.prisma.profile.upsert({
      where: { id: supabaseUser.id },
      create: { id: supabaseUser.id, email: dto.email, fullName: dto.fullName },
      update: { fullName: dto.fullName },
    });

    // 4. Create CustomerUser link
    const existing = await this.prisma.customerUser.findFirst({
      where: { customerId: dto.customerId, profileId: supabaseUser.id },
    });
    if (existing) throw new ConflictException('User already linked to this customer');

    const customerUser = await this.prisma.customerUser.create({
      data: {
        customerId: dto.customerId,
        profileId: supabaseUser.id,
        role: dto.role ?? Role.USER,
      },
    });

    return {
      message: 'User registered successfully',
      userId: supabaseUser.id,
      email: dto.email,
      role: customerUser.role,
      customerId: dto.customerId,
    };
  }

  /** POST /auth/register/b2b — self-service company registration */
  async registerB2b(dto: RegisterB2bDto, clientIp?: string) {
    if (!dto.tcAccepted || !dto.pdpaAccepted) {
      throw new BadRequestException('Must accept Terms & Conditions and PDPA');
    }

    // 1. Check Tax ID not already registered
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { taxId: dto.taxId },
    });
    if (existingCustomer) {
      throw new ConflictException('Tax ID already registered');
    }

    // 2. Create Supabase Auth user
    const { data, error } = await this.supabase.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
      user_metadata: { full_name: dto.fullName },
    });
    if (error) {
      if (error.message.includes('already')) {
        throw new ConflictException('Email already registered');
      }
      throw new BadRequestException(error.message);
    }

    const supabaseUser = data.user;
    const now = new Date();

    // 3. Generate unique customer code (up to 8 chars from English name or Tax ID)
    const rawCode = (dto.companyNameEn ?? dto.taxId)
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .substring(0, 8);
    let code = rawCode || dto.taxId.substring(0, 8);
    const codeExists = await this.prisma.customer.findUnique({ where: { code } });
    if (codeExists) code = code.substring(0, 6) + Math.floor(Math.random() * 99).toString().padStart(2, '0');

    try {
      // 4. Create Customer + Profile + CustomerUser in transaction
      const [customer] = await this.prisma.$transaction([
        this.prisma.customer.create({
          data: {
            code,
            companyNameTh: dto.companyNameTh,
            companyNameEn: dto.companyNameEn,
            taxId: dto.taxId,
            address: dto.address,
            postcode: dto.postcode,
            phone: dto.companyPhone,
            email: dto.email,
            status: 'TRIAL',
            tcVersion: dto.tcVersion,
            tcAcceptedAt: now,
            pdpaAcceptedAt: now,
            registrationIp: clientIp ?? null,
          },
        }),
        this.prisma.profile.upsert({
          where: { id: supabaseUser.id },
          create: {
            id: supabaseUser.id,
            email: dto.email,
            fullName: dto.fullName,
            jobTitle: dto.jobTitle,
            phone: dto.adminPhone,
            pdpaConsentAt: now,
          },
          update: {
            fullName: dto.fullName,
            jobTitle: dto.jobTitle,
            phone: dto.adminPhone,
            pdpaConsentAt: now,
          },
        }),
      ]);

      await this.prisma.customerUser.create({
        data: {
          customerId: customer.id,
          profileId: supabaseUser.id,
          role: Role.TENANT_ADMIN,
        },
      });

      return {
        message: 'Registration successful',
        companyCode: customer.code,
        customerId: customer.id,
        email: dto.email,
        status: 'TRIAL',
      };
    } catch (err) {
      // Rollback: delete Supabase user if DB transaction failed
      await this.supabase.auth.admin.deleteUser(supabaseUser.id).catch(() => null);
      throw err;
    }
  }

  /** GET /auth/me — current user from JWT */
  async getMe(userId: string, customerId: string | null) {
    const profile = await this.prisma.profile.findUnique({ where: { id: userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    const customerUser = customerId
      ? await this.prisma.customerUser.findFirst({
          where: { profileId: userId, customerId },
          include: { customer: { select: { id: true, code: true, companyNameTh: true } } },
        })
      : null;

    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      role: customerUser?.role ?? Role.SUPER_ADMIN,
      customer: customerUser?.customer ?? null,
    };
  }

  /** POST /auth/change-password */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    // Get user's email
    const profile = await this.prisma.profile.findUnique({ where: { id: userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    // Verify current password
    const { error: loginError } = await this.supabase.auth.signInWithPassword({
      email: profile.email,
      password: currentPassword,
    });
    if (loginError) throw new UnauthorizedException('Current password is incorrect');

    // Update via Supabase admin
    const { error: updateError } = await this.supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });
    if (updateError) throw new BadRequestException(updateError.message);

    this.auditService.log({
      actorId: userId,
      actorEmail: profile.email,
      action: 'CHANGE_PASSWORD',
      entityType: 'AUTH',
      status: 'SUCCESS',
    });

    return { message: 'Password changed successfully' };
  }
}
