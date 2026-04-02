import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Request, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
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

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('master')
export class MasterController {
  constructor(private readonly masterService: MasterService) {}

  private getCustomerId(user: RequestUser): string {
    if (user.role === Role.SUPER_ADMIN) throw new Error('Use customerId query param for super admin');
    return user.customerId;
  }

  // ─── HS Codes ──────────────────────────────────────────────────────

  @Get('hs-codes')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER)
  listHsCodes(@Request() req: { user: RequestUser }, @Query('search') search?: string) {
    return this.masterService.listHsCodes(req.user.customerId, search);
  }

  @Post('hs-codes')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  createHsCode(@Request() req: { user: RequestUser }, @Body() dto: CreateHsCodeDto) {
    return this.masterService.createHsCode(req.user.customerId, dto);
  }

  @Patch('hs-codes/:id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  updateHsCode(
    @Request() req: { user: RequestUser },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHsCodeDto,
  ) {
    return this.masterService.updateHsCode(req.user.customerId, id, dto);
  }

  @Delete('hs-codes/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  deleteHsCode(@Request() req: { user: RequestUser }, @Param('id', ParseUUIDPipe) id: string) {
    return this.masterService.deleteHsCode(req.user.customerId, id);
  }

  // ─── Exporters ─────────────────────────────────────────────────────

  @Get('exporters')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER)
  listExporters(@Request() req: { user: RequestUser }) {
    return this.masterService.listExporters(req.user.customerId);
  }

  @Post('exporters')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  createExporter(@Request() req: { user: RequestUser }, @Body() dto: CreateExporterDto) {
    return this.masterService.createExporter(req.user.customerId, dto);
  }

  @Patch('exporters/:id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  updateExporter(
    @Request() req: { user: RequestUser },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExporterDto,
  ) {
    return this.masterService.updateExporter(req.user.customerId, id, dto);
  }

  @Delete('exporters/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  deleteExporter(@Request() req: { user: RequestUser }, @Param('id', ParseUUIDPipe) id: string) {
    return this.masterService.deleteExporter(req.user.customerId, id);
  }

  // ─── Consignees ────────────────────────────────────────────────────

  @Get('consignees')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER)
  listConsignees(@Request() req: { user: RequestUser }, @Query('search') search?: string) {
    return this.masterService.listConsignees(req.user.customerId, search);
  }

  @Post('consignees')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  createConsignee(@Request() req: { user: RequestUser }, @Body() dto: CreateConsigneeDto) {
    return this.masterService.createConsignee(req.user.customerId, dto);
  }

  @Patch('consignees/:id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  updateConsignee(
    @Request() req: { user: RequestUser },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateConsigneeDto,
  ) {
    return this.masterService.updateConsignee(req.user.customerId, id, dto);
  }

  @Delete('consignees/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  deleteConsignee(@Request() req: { user: RequestUser }, @Param('id', ParseUUIDPipe) id: string) {
    return this.masterService.deleteConsignee(req.user.customerId, id);
  }

  // ─── Privileges ────────────────────────────────────────────────────

  @Get('privileges')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER)
  listPrivileges(@Request() req: { user: RequestUser }) {
    return this.masterService.listPrivileges(req.user.customerId);
  }

  @Post('privileges')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  createPrivilege(@Request() req: { user: RequestUser }, @Body() dto: CreatePrivilegeDto) {
    return this.masterService.createPrivilege(req.user.customerId, dto);
  }

  @Patch('privileges/:id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  updatePrivilege(
    @Request() req: { user: RequestUser },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePrivilegeDto,
  ) {
    return this.masterService.updatePrivilege(req.user.customerId, id, dto);
  }

  @Delete('privileges/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  deletePrivilege(@Request() req: { user: RequestUser }, @Param('id', ParseUUIDPipe) id: string) {
    return this.masterService.deletePrivilege(req.user.customerId, id);
  }
}
