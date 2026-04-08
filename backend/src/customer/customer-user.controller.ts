import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CustomerUserService } from './customer-user.service';
import { InviteUserDto, UpdateUserRoleDto } from './dto/invite-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Customer Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('customers/:customerId/users')
export class CustomerUserController {
  constructor(private readonly customerUserService: CustomerUserService) {}

  /** GET /customers/:customerId/users */
  @ApiOperation({ summary: 'รายชื่อผู้ใช้ในองค์กร (SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'List of users in customer organization' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Get()
  listUsers(@Param('customerId', ParseUUIDPipe) customerId: string) {
    return this.customerUserService.listUsers(customerId);
  }

  /** POST /customers/:customerId/users */
  @ApiOperation({ summary: 'เชิญผู้ใช้ใหม่เข้าองค์กร (SUPER_ADMIN)' })
  @ApiResponse({ status: 201, description: 'User invited successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Post()
  inviteUser(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Body() dto: InviteUserDto,
  ) {
    return this.customerUserService.inviteUser(customerId, dto);
  }

  /** PATCH /customers/:customerId/users/:profileId */
  @ApiOperation({ summary: 'เปลี่ยน role ผู้ใช้ในองค์กร (SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'User role updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Patch(':profileId')
  updateUserRole(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Param('profileId', ParseUUIDPipe) profileId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.customerUserService.updateUserRole(customerId, profileId, dto);
  }

  /** DELETE /customers/:customerId/users/:profileId */
  @ApiOperation({ summary: 'ลบผู้ใช้ออกจากองค์กร (SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'User removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Delete(':profileId')
  @HttpCode(HttpStatus.OK)
  removeUser(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Param('profileId', ParseUUIDPipe) profileId: string,
  ) {
    return this.customerUserService.removeUser(customerId, profileId);
  }
}
