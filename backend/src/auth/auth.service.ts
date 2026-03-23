import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  private supabase;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {
    this.supabase = createClient(
      this.config.get<string>('SUPABASE_URL') ?? '',
      this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
  }

  /** POST /auth/login */
  async login(dto: LoginDto) {
    // 1. Verify credentials via Supabase Auth
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });
    if (error || !data.user) {
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
}
