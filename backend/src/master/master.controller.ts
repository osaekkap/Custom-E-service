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
import { CreateBrokerDto, UpdateBrokerDto } from './dto/broker.dto';
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
    // If user has a customerId in their token, they MUST use it (Factory users)
    if (user.customerId) {
      return user.customerId;
    }
    // If they don't (SUPER_ADMIN/internal staff), they use query param or default to empty
    return queryCustomerId || '';
  }

  /** Resolve customerId for write operations — must be a valid UUID, auto-pick first customer for SUPER_ADMIN */
  private async resolveCustomerIdForWrite(user: RequestUser, queryCustomerId?: string): Promise<string> {
    const cid = this.resolveCustomerId(user, queryCustomerId);
    
    const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

    if (cid && isUuid(cid)) return cid;

    // For SUPER_ADMIN, if no customerId is passed, we try to find the FIRST active customer
    // This allows testing/initial setup without having to specify a customer ID manually every time.
    if (user.role === Role.SUPER_ADMIN) {
      const first = await this.masterService['prisma'].customer.findFirst({ 
        where: { isActive: true },
        select: { id: true } 
      });
      if (first) return first.id;
      
      throw new BadRequestException('No customers found in system. SuperAdmin must create at least one customer first.');
    }
    
    throw new BadRequestException('A valid customerId (UUID) is required for this operation.');
  }

  // ─── HS Codes ──────────────────────────────────────────────────────

  @ApiOperation({ summary: 'รายการรหัส HS Code' })
  @ApiResponse({ status: 200, description: 'List of HS codes' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('hs-codes')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER, Role.CUSTOMER_ADMIN, Role.CUSTOMER)
  listHsCodes(
    @Request() req: { user: RequestUser },
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('customerId') queryCustomerId?: string,
  ) {
    const customerId = this.resolveCustomerId(req.user, queryCustomerId);
    
    // Special case for Super Admin to see global list if no customerId provided
    if (req.user.role === Role.SUPER_ADMIN && !customerId) {
      return this.masterService.listHsCodes('', search, page ? +page : 1, limit ? +limit : 100);
    }
    
    if (!customerId && req.user.role !== Role.SUPER_ADMIN) {
      throw new BadRequestException('customerId is required');
    }

    return this.masterService.listHsCodes(customerId, search, page ? +page : 1, limit ? +limit : 100);
  }

  @ApiOperation({ summary: 'สร้างรหัส HS Code ใหม่' })
  @ApiResponse({ status: 201, description: 'HS code created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('hs-codes')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async createHsCode(@Request() req: { user: RequestUser }, @Body() dto: CreateHsCodeDto, @Query('customerId') qCid?: string) {
    return this.masterService.createHsCode(await this.resolveCustomerIdForWrite(req.user, qCid), dto);
  }

  @ApiOperation({ summary: 'แก้ไขรหัส HS Code' })
  @ApiResponse({ status: 200, description: 'HS code updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Patch('hs-codes/:id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async updateHsCode(
    @Request() req: { user: RequestUser },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHsCodeDto,
    @Query('customerId') qCid?: string,
  ) {
    return this.masterService.updateHsCode(await this.resolveCustomerIdForWrite(req.user, qCid), id, dto);
  }

  @ApiOperation({ summary: 'ลบรหัส HS Code' })
  @ApiResponse({ status: 200, description: 'HS code deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Delete('hs-codes/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async deleteHsCode(@Request() req: { user: RequestUser }, @Param('id', ParseUUIDPipe) id: string, @Query('customerId') qCid?: string) {
    return this.masterService.deleteHsCode(await this.resolveCustomerIdForWrite(req.user, qCid), id);
  }

  // ─── Exporters ─────────────────────────────────────────────────────

  @ApiOperation({ summary: 'รายการผู้ส่งออก (Exporters)' })
  @ApiResponse({ status: 200, description: 'List of exporters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('exporters')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER, Role.CUSTOMER_ADMIN, Role.CUSTOMER)
  listExporters(@Request() req: { user: RequestUser }, @Query('customerId') qCid?: string) {
    let cid = this.resolveCustomerId(req.user, qCid);
    // If SuperAdmin doesn't pass cid, load global exporters (null)
    if (!cid && req.user.role === Role.SUPER_ADMIN) {
      return this.masterService.listExporters(null as any);
    }
    return this.masterService.listExporters(cid);
  }

  @ApiOperation({ summary: 'สร้างผู้ส่งออกใหม่' })
  @ApiResponse({ status: 201, description: 'Exporter created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('exporters')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async createExporter(@Request() req: { user: RequestUser }, @Body() dto: CreateExporterDto, @Query('customerId') qCid?: string) {
    let cid = this.resolveCustomerId(req.user, qCid);
    if (!cid && req.user.role === Role.SUPER_ADMIN) {
      return this.masterService.createExporter(null, dto);
    }
    cid = await this.resolveCustomerIdForWrite(req.user, qCid);
    return this.masterService.createExporter(cid, dto);
  }

  @ApiOperation({ summary: 'แก้ไขข้อมูลผู้ส่งออก' })
  @ApiResponse({ status: 200, description: 'Exporter updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Patch('exporters/:id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async updateExporter(
    @Request() req: { user: RequestUser },
    @Param('id') id: string,
    @Body() dto: UpdateExporterDto,
    @Query('customerId') qCid?: string,
  ) {
    let cid = this.resolveCustomerId(req.user, qCid);
    if (!cid && req.user.role === Role.SUPER_ADMIN) {
      return this.masterService.updateExporter(null, id, dto);
    }
    cid = await this.resolveCustomerIdForWrite(req.user, qCid);
    return this.masterService.updateExporter(cid, id, dto);
  }

  @ApiOperation({ summary: 'ลบผู้ส่งออก' })
  @ApiResponse({ status: 200, description: 'Exporter deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Delete('exporters/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async deleteExporter(@Request() req: { user: RequestUser }, @Param('id') id: string, @Query('customerId') qCid?: string) {
    let cid = this.resolveCustomerId(req.user, qCid);
    if (!cid && req.user.role === Role.SUPER_ADMIN) {
      return this.masterService.deleteExporter(null as any, id);
    }
    cid = await this.resolveCustomerIdForWrite(req.user, qCid);
    return this.masterService.deleteExporter(cid, id);
  }

  // ─── Consignees ────────────────────────────────────────────────────

  @ApiOperation({ summary: 'รายการผู้รับสินค้า (Consignees)' })
  @ApiResponse({ status: 200, description: 'List of consignees' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('consignees')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER, Role.CUSTOMER_ADMIN, Role.CUSTOMER)
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
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async createConsignee(@Request() req: { user: RequestUser }, @Body() dto: CreateConsigneeDto, @Query('customerId') qCid?: string) {
    return this.masterService.createConsignee(await this.resolveCustomerIdForWrite(req.user, qCid), dto);
  }

  @ApiOperation({ summary: 'แก้ไขข้อมูลผู้รับสินค้า' })
  @ApiResponse({ status: 200, description: 'Consignee updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Patch('consignees/:id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async updateConsignee(
    @Request() req: { user: RequestUser },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateConsigneeDto,
    @Query('customerId') qCid?: string,
  ) {
    return this.masterService.updateConsignee(await this.resolveCustomerIdForWrite(req.user, qCid), id, dto);
  }

  @ApiOperation({ summary: 'ลบผู้รับสินค้า' })
  @ApiResponse({ status: 200, description: 'Consignee deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Delete('consignees/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async deleteConsignee(@Request() req: { user: RequestUser }, @Param('id', ParseUUIDPipe) id: string, @Query('customerId') qCid?: string) {
    return this.masterService.deleteConsignee(await this.resolveCustomerIdForWrite(req.user, qCid), id);
  }

  // ─── Brokers ──────────────────────────────────────────────────────

  @ApiOperation({ summary: 'รายการตัวแทนออกของ (Brokers)' })
  @ApiResponse({ status: 200, description: 'List of brokers' })
  @Get('brokers')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER, Role.CUSTOMER_ADMIN, Role.CUSTOMER)
  listBrokers(@Request() req: { user: RequestUser }, @Query('customerId') qCid?: string) {
    let cid = this.resolveCustomerId(req.user, qCid);
    if (!cid && req.user.role === Role.SUPER_ADMIN) {
      return this.masterService.listBrokers(null);
    }
    return this.masterService.listBrokers(cid);
  }

  @ApiOperation({ summary: 'สร้างตัวแทนออกของใหม่' })
  @ApiResponse({ status: 201, description: 'Broker created' })
  @Post('brokers')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async createBroker(@Request() req: { user: RequestUser }, @Body() dto: CreateBrokerDto, @Query('customerId') qCid?: string) {
    let cid = this.resolveCustomerId(req.user, qCid);
    if (!cid && req.user.role === Role.SUPER_ADMIN) {
      return this.masterService.createBroker(null, dto);
    }
    cid = await this.resolveCustomerIdForWrite(req.user, qCid);
    return this.masterService.createBroker(cid, dto);
  }

  @ApiOperation({ summary: 'แก้ไขตัวแทนออกของ' })
  @ApiResponse({ status: 200, description: 'Broker updated' })
  @Patch('brokers/:id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async updateBroker(
    @Request() req: { user: RequestUser },
    @Param('id') id: string,
    @Body() dto: UpdateBrokerDto,
    @Query('customerId') qCid?: string,
  ) {
    let cid = this.resolveCustomerId(req.user, qCid);
    if (!cid && req.user.role === Role.SUPER_ADMIN) {
      return this.masterService.updateBroker(null, id, dto);
    }
    cid = await this.resolveCustomerIdForWrite(req.user, qCid);
    return this.masterService.updateBroker(cid, id, dto);
  }

  @ApiOperation({ summary: 'ลบตัวแทนออกของ' })
  @ApiResponse({ status: 200, description: 'Broker deleted' })
  @Delete('brokers/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async deleteBroker(@Request() req: { user: RequestUser }, @Param('id') id: string, @Query('customerId') qCid?: string) {
    let cid = this.resolveCustomerId(req.user, qCid);
    if (!cid && req.user.role === Role.SUPER_ADMIN) {
      return this.masterService.deleteBroker(null, id);
    }
    cid = await this.resolveCustomerIdForWrite(req.user, qCid);
    return this.masterService.deleteBroker(cid, id);
  }

  // ─── Privileges ────────────────────────────────────────────────────

  @ApiOperation({ summary: 'รายการสิทธิพิเศษ (Privileges)' })
  @ApiResponse({ status: 200, description: 'List of privileges' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('privileges')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER, Role.CUSTOMER_ADMIN, Role.CUSTOMER)
  listPrivileges(@Request() req: { user: RequestUser }, @Query('customerId') qCid?: string) {
    return this.masterService.listPrivileges(this.resolveCustomerId(req.user, qCid));
  }

  @ApiOperation({ summary: 'สร้างสิทธิพิเศษใหม่' })
  @ApiResponse({ status: 201, description: 'Privilege created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('privileges')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async createPrivilege(@Request() req: { user: RequestUser }, @Body() dto: CreatePrivilegeDto, @Query('customerId') qCid?: string) {
    return this.masterService.createPrivilege(await this.resolveCustomerIdForWrite(req.user, qCid), dto);
  }

  @ApiOperation({ summary: 'แก้ไขสิทธิพิเศษ' })
  @ApiResponse({ status: 200, description: 'Privilege updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Patch('privileges/:id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async updatePrivilege(
    @Request() req: { user: RequestUser },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePrivilegeDto,
    @Query('customerId') qCid?: string,
  ) {
    return this.masterService.updatePrivilege(await this.resolveCustomerIdForWrite(req.user, qCid), id, dto);
  }

  @ApiOperation({ summary: 'ลบสิทธิพิเศษ' })
  @ApiResponse({ status: 200, description: 'Privilege deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Delete('privileges/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.CUSTOMER_ADMIN)
  async deletePrivilege(@Request() req: { user: RequestUser }, @Param('id', ParseUUIDPipe) id: string, @Query('customerId') qCid?: string) {
    return this.masterService.deletePrivilege(await this.resolveCustomerIdForWrite(req.user, qCid), id);
  }
}
