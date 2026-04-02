import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async listByRoles(roles: Role[]) {
    const customerUsers = await this.prisma.customerUser.findMany({
      where: { role: { in: roles } },
      include: {
        profile: { select: { id: true, email: true, fullName: true, jobTitle: true } },
      },
      orderBy: { profile: { fullName: 'asc' } },
    });

    return customerUsers.map((cu) => ({
      id: cu.profile.id,
      email: cu.profile.email,
      fullName: cu.profile.fullName,
      jobTitle: cu.profile.jobTitle,
      role: cu.role,
      customerId: cu.customerId,
    }));
  }
}
