import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Request, UseGuards, ParseUUIDPipe,
  HttpCode, HttpStatus,
} from '@nestjs/common';
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

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly customerUserService: CustomerUserService,
  ) {}

  // ─── Self-service routes (TENANT_ADMIN) ────────────────────────

  /** GET /customers/my — ดูข้อมูลบริษัทตัวเอง */
  @Roles(Role.TENANT_ADMIN, Role.SUPER_ADMIN)
  @Get('my')
  findMy(@Request() req: { user: RequestUser }) {
    return this.customerService.findOne(req.user.customerId!);
  }

  /** PATCH /customers/my — แก้ไขข้อมูลบริษัทตัวเอง */
  @Roles(Role.TENANT_ADMIN, Role.SUPER_ADMIN)
  @Patch('my')
  updateMy(
    @Request() req: { user: RequestUser },
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customerService.update(req.user.customerId!, dto);
  }

  /** GET /customers/my/users — รายชื่อผู้ใช้ในองค์กร */
  @Roles(Role.TENANT_ADMIN, Role.SUPER_ADMIN)
  @Get('my/users')
  listMyUsers(@Request() req: { user: RequestUser }) {
    return this.customerUserService.listUsers(req.user.customerId!);
  }

  /** POST /customers/my/users — เชิญผู้ใช้ใหม่ */
  @Roles(Role.TENANT_ADMIN, Role.SUPER_ADMIN)
  @Post('my/users')
  inviteMyUser(
    @Request() req: { user: RequestUser },
    @Body() dto: InviteUserDto,
  ) {
    return this.customerUserService.inviteUser(req.user.customerId!, dto);
  }

  /** PATCH /customers/my/users/:profileId — เปลี่ยน role ผู้ใช้ */
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
  @Roles(Role.SUPER_ADMIN)
  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.customerService.create(dto);
  }

  /** GET /customers — รายการลูกค้าทั้งหมด (SUPER_ADMIN only) */
  @Roles(Role.SUPER_ADMIN)
  @Get()
  findAll(@Query() query: QueryCustomerDto) {
    return this.customerService.findAll(query);
  }

  /** GET /customers/:id — ดูรายละเอียดลูกค้า (SUPER_ADMIN only) */
  @Roles(Role.SUPER_ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.customerService.findOne(id);
  }

  /** PATCH /customers/:id — แก้ไขข้อมูลลูกค้า (SUPER_ADMIN only) */
  @Roles(Role.SUPER_ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customerService.update(id, dto);
  }

  /** DELETE /customers/:id — soft delete (SUPER_ADMIN only) */
  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.customerService.remove(id);
  }
}
