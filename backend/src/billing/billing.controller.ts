import {
  Controller, Get, Post, Patch, Body, Param,
  Query, UseGuards, Request, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from './dto/billing.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { RequestUser } from '../auth/jwt.strategy';

@ApiTags('Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  /** GET /billing/items?invoiced=false */
  @ApiOperation({ summary: 'รายการ billing items (กรองด้วย invoiced status)' })
  @ApiResponse({ status: 200, description: 'List of billing items' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('items')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.CUSTOMER_ADMIN, Role.CUSTOMER)
  listItems(
    @Request() req: { user: RequestUser },
    @Query('invoiced') invoiced?: string,
  ) {
    return this.billingService.listItems(req.user, invoiced);
  }

  /** POST /billing/invoices — สร้าง invoice */
  @ApiOperation({ summary: 'สร้าง invoice ใหม่' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Post('invoices')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER)
  createInvoice(
    @Body() dto: CreateInvoiceDto,
    @Request() req: { user: RequestUser },
  ) {
    return this.billingService.createInvoice(dto, req.user);
  }

  /** GET /billing/invoices?customerId= */
  @ApiOperation({ summary: 'รายการ invoices ทั้งหมด (กรองตาม customerId)' })
  @ApiResponse({ status: 200, description: 'List of invoices' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('invoices')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.CUSTOMER_ADMIN, Role.CUSTOMER)
  listInvoices(
    @Request() req: { user: RequestUser },
    @Query('customerId') customerId?: string,
  ) {
    return this.billingService.listInvoices(req.user, customerId);
  }

  /** GET /billing/invoices/:id */
  @ApiOperation({ summary: 'ดูรายละเอียด invoice' })
  @ApiResponse({ status: 200, description: 'Invoice details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @Get('invoices/:id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.CUSTOMER_ADMIN, Role.CUSTOMER)
  findInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.billingService.findInvoice(id, req.user);
  }

  /** PATCH /billing/invoices/:id/status */
  @ApiOperation({ summary: 'อัปเดตสถานะ invoice' })
  @ApiResponse({ status: 200, description: 'Invoice status updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @Patch('invoices/:id/status')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.CUSTOMER_ADMIN)
  updateInvoiceStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvoiceStatusDto,
    @Request() req: { user: RequestUser },
  ) {
    return this.billingService.updateInvoiceStatus(id, dto, req.user);
  }
}
