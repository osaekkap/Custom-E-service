import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** GET /users?role=STAFF,TENANT_ADMIN,MANAGER — list users by role(s) */
  @Get()
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER)
  list(@Query('role') roleParam?: string) {
    const roles: Role[] = roleParam
      ? (roleParam.split(',').filter((r) => Object.values(Role).includes(r as Role)) as Role[])
      : [Role.STAFF, Role.TENANT_ADMIN, Role.MANAGER];

    return this.usersService.listByRoles(roles);
  }
}
