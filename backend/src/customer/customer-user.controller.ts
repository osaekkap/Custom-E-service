import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CustomerUserService } from './customer-user.service';
import { InviteUserDto, UpdateUserRoleDto } from './dto/invite-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('customers/:customerId/users')
export class CustomerUserController {
  constructor(private readonly customerUserService: CustomerUserService) {}

  /** GET /customers/:customerId/users */
  @Get()
  listUsers(@Param('customerId', ParseUUIDPipe) customerId: string) {
    return this.customerUserService.listUsers(customerId);
  }

  /** POST /customers/:customerId/users */
  @Post()
  inviteUser(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Body() dto: InviteUserDto,
  ) {
    return this.customerUserService.inviteUser(customerId, dto);
  }

  /** PATCH /customers/:customerId/users/:profileId */
  @Patch(':profileId')
  updateUserRole(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Param('profileId', ParseUUIDPipe) profileId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.customerUserService.updateUserRole(customerId, profileId, dto);
  }

  /** DELETE /customers/:customerId/users/:profileId */
  @Delete(':profileId')
  @HttpCode(HttpStatus.OK)
  removeUser(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Param('profileId', ParseUUIDPipe) profileId: string,
  ) {
    return this.customerUserService.removeUser(customerId, profileId);
  }
}
