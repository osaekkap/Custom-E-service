import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Request, ParseUUIDPipe, HttpCode, HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { MasterService } from './master.service';
import { CreateHsCodeDto, UpdateHsCodeDto } from './dto/hs-code.dto';
import { CreateExporterDto, UpdateExporterDto } from './dto/exporter.dto';
import { CreateConsigneeDto, UpdateConsigneeDto } from './dto/consignee.dto';
import { CreatePrivilegeDto, UpdatePrivilegeDto } from './dto/privilege.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RequestUser } from '../auth/jwt.strategy';
import { Role } from '@prisma/client';

@ApiTags('Master Data')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('master')
export class MasterController {
  constructor(private readonly masterService: MasterService) {}

  /** Resolve customerId: SUPER_ADMIN/internal staff use query param, others use JWT */
  private resolveCustomerId(user: RequestUser, queryCustomerId?: string): string {
    if (user.role === Role.SUPER_ADMIN || !user.customerId) {
      if (!queryCustomerId) throw new BadRequestException('customerId query param is required for admin/internal users');
      return queryCustomerId;
    }
    return user.customerId;
  }

  // ─── HS Codes ──────────────────────────────────────────────────────

  @ApiOperation({ summary: 'รายการรหัส HS Code' })
  @ApiResponse({ status: 200, description: 'List of HS codes' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('hs-codes')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER)
  listHsCodes(
    @Request() req: { user: RequestUser },
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('customerId') queryCustomerId?: string,
  ) {
    const customerId = this.resolveCustomerId(req.user, queryCustomerId);
    return this.masterService.listHsCodes(customerId, search, page ? +page : 1, limit ? +limit : 100);
  }

  @ApiOperation({ summary: 'สร้างรหัส HS Code ใหม่' })
  @ApiResponse({ status: 201, description: 'HS code created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('hs-codes')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  createHsCode(@Request() req: { user: RequestUser }, @Body() dto: CreateHsCodeDto, @Query('customerId') qCid?: string) {
    return this.masterService.createHsCode(this.resolveCustomerId(req.user, qCid), dto);
  }

  @ApiOperation({ summary: 'แก้ไขรหัส HS Code' })
  @ApiResponse({ status: 200, description: 'HS code updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Patch('hs-codes/:id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  updateHsCode(
    @Request() req: { user: RequestUser },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHsCodeDto,
    @Query('customerId') qCid?: string,
  ) {
    return this.masterService.updateHsCode(this.resolveCustomerId(req.user, qCid), id, dto);
  }

  @ApiOperation({ summary: 'ลบรหัส HS Code' })
  @ApiResponse({ status: 200, description: 'HS code deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Delete('hs-codes/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  deleteHsCode(@Request() req: { user: RequestUser }, @Param('id', ParseUUIDPipe) id: string, @Query('customerId') qCid?: string) {
    return this.masterService.deleteHsCode(this.resolveCustomerId(req.user, qCid), id);
  }

  // ─── Exporters ─────────────────────────────────────────────────────

  @ApiOperation({ summary: 'รายการผู้ส่งออก (Exporters)' })
  @ApiResponse({ status: 200, description: 'List of exporters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('exporters')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER)
  listExporters(@Request() req: { user: RequestUser }, @Query('customerId') qCid?: string) {
    return this.masterService.listExporters(this.resolveCustomerId(req.user, qCid));
  }

  @ApiOperation({ summary: 'สร้างผู้ส่งออกใหม่' })
  @ApiResponse({ status: 201, description: 'Exporter created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('exporters')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  createExporter(@Request() req: { user: RequestUser }, @Body() dto: CreateExporterDto, @Query('customerId') qCid?: string) {
    return this.masterService.createExporter(this.resolveCustomerId(req.user, qCid), dto);
  }

  @ApiOperation({ summary: 'แก้ไขข้อมูลผู้ส่งออก' })
  @ApiResponse({ status: 200, description: 'Exporter updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Patch('exporters/:id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  updateExporter(
    @Request() req: { user: RequestUser },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExporterDto,
    @Query('customerId') qCid?: string,
  ) {
    return this.masterService.updateExporter(this.resolveCustomerId(req.user, qCid), id, dto);
  }

  @ApiOperation({ summary: 'ลบผู้ส่งออก' })
  @ApiResponse({ status: 200, description: 'Exporter deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Delete('exporters/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  deleteExporter(@Request() req: { user: RequestUser }, @Param('id', ParseUUIDPipe) id: string, @Query('customerId') qCid?: string) {
    return this.masterService.deleteExporter(this.resolveCustomerId(req.user, qCid), id);
  }

  // ─── Consignees ────────────────────────────────────────────────────

  @ApiOperation({ summary: 'รายการผู้รับสินค้า (Consignees)' })
  @ApiResponse({ status: 200, description: 'List of consignees' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('consignees')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER)
  listConsignees(
    @Request() req: { user: RequestUser },
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('customerId') qCid?: string,
  ) {
    const customerId = this.resolveCustomerId(req.user, qCid);
    return this.masterService.listConsignees(customerId, search, page ? +page : 1, limit ? +limit : 100);
  }

  @ApiOperation({ summary: 'สร้างผู้รับสินค้าใหม่' })
  @ApiResponse({ status: 201, description: 'Consignee created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('consignees')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  createConsignee(@Request() req: { user: RequestUser }, @Body() dto: CreateConsigneeDto, @Query('customerId') qCid?: string) {
    return this.masterService.createConsignee(this.resolveCustomerId(req.user, qCid), dto);
  }

  @ApiOperation({ summary: 'แก้ไขข้อมูลผู้รับสินค้า' })
  @ApiResponse({ status: 200, description: 'Consignee updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Patch('consignees/:id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  updateConsignee(
    @Request() req: { user: RequestUser },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateConsigneeDto,
    @Query('customerId') qCid?: string,
  ) {
    return this.masterService.updateConsignee(this.resolveCustomerId(req.user, qCid), id, dto);
  }

  @ApiOperation({ summary: 'ลบผู้รับสินค้า' })
  @ApiResponse({ status: 200, description: 'Consignee deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Delete('consignees/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  deleteConsignee(@Request() req: { user: RequestUser }, @Param('id', ParseUUIDPipe) id: string, @Query('customerId') qCid?: string) {
    return this.masterService.deleteConsignee(this.resolveCustomerId(req.user, qCid), id);
  }

  // ─── Privileges ────────────────────────────────────────────────────

  @ApiOperation({ summary: 'รายการสิทธิพิเศษ (Privileges)' })
  @ApiResponse({ status: 200, description: 'List of privileges' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('privileges')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER)
  listPrivileges(@Request() req: { user: RequestUser }, @Query('customerId') qCid?: string) {
    return this.masterService.listPrivileges(this.resolveCustomerId(req.user, qCid));
  }

  @ApiOperation({ summary: 'สร้างสิทธิพิเศษใหม่' })
  @ApiResponse({ status: 201, description: 'Privilege created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('privileges')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  createPrivilege(@Request() req: { user: RequestUser }, @Body() dto: CreatePrivilegeDto, @Query('customerId') qCid?: string) {
    return this.masterService.createPrivilege(this.resolveCustomerId(req.user, qCid), dto);
  }

  @ApiOperation({ summary: 'แก้ไขสิทธิพิเศษ' })
  @ApiResponse({ status: 200, description: 'Privilege updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Patch('privileges/:id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  updatePrivilege(
    @Request() req: { user: RequestUser },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePrivilegeDto,
    @Query('customerId') qCid?: string,
  ) {
    return this.masterService.updatePrivilege(this.resolveCustomerId(req.user, qCid), id, dto);
  }

  @ApiOperation({ summary: 'ลบสิทธิพิเศษ' })
  @ApiResponse({ status: 200, description: 'Privilege deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Delete('privileges/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  deletePrivilege(@Request() req: { user: RequestUser }, @Param('id', ParseUUIDPipe) id: string, @Query('customerId') qCid?: string) {
    return this.masterService.deletePrivilege(this.resolveCustomerId(req.user, qCid), id);
  }
}
