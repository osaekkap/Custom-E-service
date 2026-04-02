import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Request, ParseUUIDPipe, HttpCode, HttpStatus,
  BadRequestException,
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

  /** Resolve customerId: SUPER_ADMIN/internal staff use query param, others use JWT */
  private resolveCustomerId(user: RequestUser, queryCustomerId?: string): string {
    if (user.role === Role.SUPER_ADMIN || !user.customerId) {
      if (!queryCustomerId) throw new BadRequestException('customerId query param is required for admin/internal users');
      return queryCustomerId;
    }
    return user.customerId;
  }

  // ─── HS Codes ──────────────────────────────────────────────────────

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

  @Post('hs-codes')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  createHsCode(@Request() req: { user: RequestUser }, @Body() dto: CreateHsCodeDto, @Query('customerId') qCid?: string) {
    return this.masterService.createHsCode(this.resolveCustomerId(req.user, qCid), dto);
  }

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

  @Delete('hs-codes/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  deleteHsCode(@Request() req: { user: RequestUser }, @Param('id', ParseUUIDPipe) id: string, @Query('customerId') qCid?: string) {
    return this.masterService.deleteHsCode(this.resolveCustomerId(req.user, qCid), id);
  }

  // ─── Exporters ─────────────────────────────────────────────────────

  @Get('exporters')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER)
  listExporters(@Request() req: { user: RequestUser }, @Query('customerId') qCid?: string) {
    return this.masterService.listExporters(this.resolveCustomerId(req.user, qCid));
  }

  @Post('exporters')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  createExporter(@Request() req: { user: RequestUser }, @Body() dto: CreateExporterDto, @Query('customerId') qCid?: string) {
    return this.masterService.createExporter(this.resolveCustomerId(req.user, qCid), dto);
  }

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

  @Delete('exporters/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  deleteExporter(@Request() req: { user: RequestUser }, @Param('id', ParseUUIDPipe) id: string, @Query('customerId') qCid?: string) {
    return this.masterService.deleteExporter(this.resolveCustomerId(req.user, qCid), id);
  }

  // ─── Consignees ────────────────────────────────────────────────────

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

  @Post('consignees')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  createConsignee(@Request() req: { user: RequestUser }, @Body() dto: CreateConsigneeDto, @Query('customerId') qCid?: string) {
    return this.masterService.createConsignee(this.resolveCustomerId(req.user, qCid), dto);
  }

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

  @Delete('consignees/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  deleteConsignee(@Request() req: { user: RequestUser }, @Param('id', ParseUUIDPipe) id: string, @Query('customerId') qCid?: string) {
    return this.masterService.deleteConsignee(this.resolveCustomerId(req.user, qCid), id);
  }

  // ─── Privileges ────────────────────────────────────────────────────

  @Get('privileges')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER)
  listPrivileges(@Request() req: { user: RequestUser }, @Query('customerId') qCid?: string) {
    return this.masterService.listPrivileges(this.resolveCustomerId(req.user, qCid));
  }

  @Post('privileges')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  createPrivilege(@Request() req: { user: RequestUser }, @Body() dto: CreatePrivilegeDto, @Query('customerId') qCid?: string) {
    return this.masterService.createPrivilege(this.resolveCustomerId(req.user, qCid), dto);
  }

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

  @Delete('privileges/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  deletePrivilege(@Request() req: { user: RequestUser }, @Param('id', ParseUUIDPipe) id: string, @Query('customerId') qCid?: string) {
    return this.masterService.deletePrivilege(this.resolveCustomerId(req.user, qCid), id);
  }
}
