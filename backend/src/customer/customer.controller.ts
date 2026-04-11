import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Request, UseGuards, ParseUUIDPipe,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CustomerUserService } from './customer-user.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { InviteUserDto, UpdateUserRoleDto } from './dto/invite-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { RequestUser } from '../auth/jwt.strategy';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly customerUserService: CustomerUserService,
  ) {}

  // ─── Self-service routes (TENANT_ADMIN) ────────────────────────

  /** GET /customers/my — ดูข้อมูลบริษัทตัวเอง */
  @ApiOperation({ summary: 'ดูข้อมูลบริษัทของตัวเอง (TENANT_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Customer profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Roles(Role.TENANT_ADMIN, Role.SUPER_ADMIN, Role.CUSTOMER_ADMIN, Role.CUSTOMER, Role.MANAGER, Role.STAFF, Role.USER)
  @Get('my')
  findMy(@Request() req: { user: RequestUser }) {
    return this.customerService.findOne(req.user.customerId!);
  }

  /** PATCH /customers/my — แก้ไขข้อมูลบริษัทตัวเอง */
  @ApiOperation({ summary: 'แก้ไขข้อมูลบริษัทของตัวเอง (TENANT_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Roles(Role.TENANT_ADMIN, Role.SUPER_ADMIN)
  @Patch('my')
  updateMy(
    @Request() req: { user: RequestUser },
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customerService.update(req.user.customerId!, dto);
  }

  /** GET /customers/my/users — รายชื่อผู้ใช้ในองค์กร */
  @ApiOperation({ summary: 'รายชื่อผู้ใช้ในองค์กรตัวเอง' })
  @ApiResponse({ status: 200, description: 'List of users in organization' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Roles(Role.TENANT_ADMIN, Role.SUPER_ADMIN)
  @Get('my/users')
  listMyUsers(@Request() req: { user: RequestUser }) {
    return this.customerUserService.listUsers(req.user.customerId!);
  }

  /** POST /customers/my/users — เชิญผู้ใช้ใหม่ */
  @ApiOperation({ summary: 'เชิญผู้ใช้ใหม่เข้าองค์กร' })
  @ApiResponse({ status: 201, description: 'User invited successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles(Role.TENANT_ADMIN, Role.SUPER_ADMIN)
  @Post('my/users')
  inviteMyUser(
    @Request() req: { user: RequestUser },
    @Body() dto: InviteUserDto,
  ) {
    return this.customerUserService.inviteUser(req.user.customerId!, dto);
  }

  /** PATCH /customers/my/users/:profileId — เปลี่ยน role ผู้ใช้ */
  @ApiOperation({ summary: 'เปลี่ยน role ของผู้ใช้ในองค์กร' })
  @ApiResponse({ status: 200, description: 'User role updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Roles(Role.TENANT_ADMIN, Role.SUPER_ADMIN)
  @Patch('my/users/:profileId')
  updateMyUserRole(
    @Request() req: { user: RequestUser },
    @Param('profileId', ParseUUIDPipe) profileId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.customerUserService.updateUserRole(req.user.customerId!, profileId, dto);
  }

  /** DELETE /customers/my/users/:profileId — ลบผู้ใช้ออกจากองค์กร */
  @ApiOperation({ summary: 'ลบผู้ใช้ออกจากองค์กร' })
  @ApiResponse({ status: 200, description: 'User removed from organization' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Roles(Role.TENANT_ADMIN, Role.SUPER_ADMIN)
  @Delete('my/users/:profileId')
  @HttpCode(HttpStatus.OK)
  removeMyUser(
    @Request() req: { user: RequestUser },
    @Param('profileId', ParseUUIDPipe) profileId: string,
  ) {
    return this.customerUserService.removeUser(req.user.customerId!, profileId);
  }

  // ─── SUPER_ADMIN routes ─────────────────────────────────────────

  /** POST /customers — สร้างลูกค้าใหม่ (SUPER_ADMIN only) */
  @ApiOperation({ summary: 'สร้างลูกค้าใหม่ (SUPER_ADMIN เท่านั้น)' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles(Role.SUPER_ADMIN)
  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.customerService.create(dto);
  }

  /** GET /customers — รายการลูกค้าทั้งหมด (SUPER_ADMIN only) */
  @ApiOperation({ summary: 'รายการลูกค้าทั้งหมด (SUPER_ADMIN เท่านั้น)' })
  @ApiResponse({ status: 200, description: 'List of all customers' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles(Role.SUPER_ADMIN)
  @Get()
  findAll(@Query() query: QueryCustomerDto) {
    return this.customerService.findAll(query);
  }

  /** GET /customers/:id — ดูรายละเอียดลูกค้า (SUPER_ADMIN only) */
  @ApiOperation({ summary: 'ดูรายละเอียดลูกค้าตาม ID (SUPER_ADMIN เท่านั้น)' })
  @ApiResponse({ status: 200, description: 'Customer details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @Roles(Role.SUPER_ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.customerService.findOne(id);
  }

  /** PATCH /customers/:id — แก้ไขข้อมูลลูกค้า (SUPER_ADMIN only) */
  @ApiOperation({ summary: 'แก้ไขข้อมูลลูกค้า (SUPER_ADMIN เท่านั้น)' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @Roles(Role.SUPER_ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customerService.update(id, dto);
  }

  /** DELETE /customers/:id — soft delete (SUPER_ADMIN only) */
  @ApiOperation({ summary: 'ลบลูกค้า soft delete (SUPER_ADMIN เท่านั้น)' })
  @ApiResponse({ status: 200, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.customerService.remove(id);
  }
}
