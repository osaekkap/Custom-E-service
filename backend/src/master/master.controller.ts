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
import { RequestUser } from '../auth/jwt.strategy';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('master')
export class MasterController {
  constructor(private readonly masterService: MasterService) {}

  private getCustomerId(user: RequestUser): string {
    if (user.role === Role.SUPER_ADMIN) throw new Error('Use customerId query param for super admin');
    return user.customerId;
  }

  // ─── HS Codes ──────────────────────────────────────────────────────

  @Get('hs-codes')
  listHsCodes(@Request() req: { user: RequestUser }, @Query('search') search?: string) {
    return this.masterService.listHsCodes(req.user.customerId, search);
  }

  @Post('hs-codes')
  createHsCode(@Request() req: { user: RequestUser }, @Body() dto: CreateHsCodeDto) {
    return this.masterService.createHsCode(req.user.customerId, dto);
  }

  @Patch('hs-codes/:id')
  updateHsCode(
    @Request() req: { user: RequestUser },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHsCodeDto,
  ) {
    return this.masterService.updateHsCode(req.user.customerId, id, dto);
  }

  @Delete('hs-codes/:id')
  @HttpCode(HttpStatus.OK)
  deleteHsCode(@Request() req: { user: RequestUser }, @Param('id', ParseUUIDPipe) id: string) {
    return this.masterService.deleteHsCode(req.user.customerId, id);
  }

  // ─── Exporters ─────────────────────────────────────────────────────

  @Get('exporters')
  listExporters(@Request() req: { user: RequestUser }) {
    return this.masterService.listExporters(req.user.customerId);
  }

  @Post('exporters')
  createExporter(@Request() req: { user: RequestUser }, @Body() dto: CreateExporterDto) {
    return this.masterService.createExporter(req.user.customerId, dto);
  }

  @Patch('exporters/:id')
  updateExporter(
    @Request() req: { user: RequestUser },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExporterDto,
  ) {
    return this.masterService.updateExporter(req.user.customerId, id, dto);
  }

  @Delete('exporters/:id')
  @HttpCode(HttpStatus.OK)
  deleteExporter(@Request() req: { user: RequestUser }, @Param('id', ParseUUIDPipe) id: string) {
    return this.masterService.deleteExporter(req.user.customerId, id);
  }

  // ─── Consignees ────────────────────────────────────────────────────

  @Get('consignees')
  listConsignees(@Request() req: { user: RequestUser }, @Query('search') search?: string) {
    return this.masterService.listConsignees(req.user.customerId, search);
  }

  @Post('consignees')
  createConsignee(@Request() req: { user: RequestUser }, @Body() dto: CreateConsigneeDto) {
    return this.masterService.createConsignee(req.user.customerId, dto);
  }

  @Patch('consignees/:id')
  updateConsignee(
    @Request() req: { user: RequestUser },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateConsigneeDto,
  ) {
    return this.masterService.updateConsignee(req.user.customerId, id, dto);
  }

  @Delete('consignees/:id')
  @HttpCode(HttpStatus.OK)
  deleteConsignee(@Request() req: { user: RequestUser }, @Param('id', ParseUUIDPipe) id: string) {
    return this.masterService.deleteConsignee(req.user.customerId, id);
  }

  // ─── Privileges ────────────────────────────────────────────────────

  @Get('privileges')
  listPrivileges(@Request() req: { user: RequestUser }) {
    return this.masterService.listPrivileges(req.user.customerId);
  }

  @Post('privileges')
  createPrivilege(@Request() req: { user: RequestUser }, @Body() dto: CreatePrivilegeDto) {
    return this.masterService.createPrivilege(req.user.customerId, dto);
  }

  @Patch('privileges/:id')
  updatePrivilege(
    @Request() req: { user: RequestUser },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePrivilegeDto,
  ) {
    return this.masterService.updatePrivilege(req.user.customerId, id, dto);
  }

  @Delete('privileges/:id')
  @HttpCode(HttpStatus.OK)
  deletePrivilege(@Request() req: { user: RequestUser }, @Param('id', ParseUUIDPipe) id: string) {
    return this.masterService.deletePrivilege(req.user.customerId, id);
  }
}
