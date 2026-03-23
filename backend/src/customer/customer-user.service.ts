import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';
import { InviteUserDto, UpdateUserRoleDto } from './dto/invite-user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class CustomerUserService {
  private supabase;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.supabase = createClient(
      this.config.get<string>('SUPABASE_URL') ?? '',
      this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
  }

  /** GET /customers/:id/users */
  async listUsers(customerId: string) {
    await this.assertCustomerExists(customerId);

    return this.prisma.customerUser.findMany({
      where: { customerId },
      include: {
        profile: { select: { id: true, email: true, fullName: true } },
      },
      orderBy: { role: 'asc' },
    });
  }

  /** POST /customers/:id/users — invite new user */
  async inviteUser(customerId: string, dto: InviteUserDto) {
    await this.assertCustomerExists(customerId);

    // 1. Create Supabase Auth user
    const { data, error } = await this.supabase.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
      user_metadata: { full_name: dto.fullName },
    });
    if (error) {
      if (error.message.toLowerCase().includes('already')) {
        throw new ConflictException('Email already registered');
      }
      throw new ConflictException(error.message);
    }

    const userId = data.user.id;

    // 2. Upsert Profile
    await this.prisma.profile.upsert({
      where: { id: userId },
      create: { id: userId, email: dto.email, fullName: dto.fullName },
      update: { fullName: dto.fullName },
    });

    // 3. Check not already linked
    const existing = await this.prisma.customerUser.findUnique({
      where: { customerId_profileId: { customerId, profileId: userId } },
    });
    if (existing) throw new ConflictException('User already linked to this customer');

    // 4. Create CustomerUser link
    const customerUser = await this.prisma.customerUser.create({
      data: {
        customerId,
        profileId: userId,
        role: dto.role ?? Role.USER,
      },
      include: {
        profile: { select: { id: true, email: true, fullName: true } },
      },
    });

    return customerUser;
  }

  /** PATCH /customers/:id/users/:profileId — change role */
  async updateUserRole(customerId: string, profileId: string, dto: UpdateUserRoleDto) {
    const cu = await this.prisma.customerUser.findUnique({
      where: { customerId_profileId: { customerId, profileId } },
    });
    if (!cu) throw new NotFoundException('User not found in this customer');

    if (dto.role === Role.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot assign SUPER_ADMIN via this endpoint');
    }

    return this.prisma.customerUser.update({
      where: { customerId_profileId: { customerId, profileId } },
      data: { role: dto.role },
      include: {
        profile: { select: { id: true, email: true, fullName: true } },
      },
    });
  }

  /** DELETE /customers/:id/users/:profileId — remove user from customer */
  async removeUser(customerId: string, profileId: string) {
    const cu = await this.prisma.customerUser.findUnique({
      where: { customerId_profileId: { customerId, profileId } },
    });
    if (!cu) throw new NotFoundException('User not found in this customer');

    await this.prisma.customerUser.delete({
      where: { customerId_profileId: { customerId, profileId } },
    });

    return { message: 'User removed from customer' };
  }

  private async assertCustomerExists(customerId: string) {
    const c = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!c) throw new NotFoundException(`Customer ${customerId} not found`);
  }
}
