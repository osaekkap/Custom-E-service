import {
  Controller, Get, Post, Patch, Body, Param,
  Query, UseGuards, Request, ParseUUIDPipe,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from './dto/billing.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { RequestUser } from '../auth/jwt.strategy';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  /** GET /billing/items?invoiced=false */
  @Get('items')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.CUSTOMER_ADMIN, Role.CUSTOMER)
  listItems(
    @Request() req: { user: RequestUser },
    @Query('invoiced') invoiced?: string,
  ) {
    return this.billingService.listItems(req.user, invoiced);
  }

  /** POST /billing/invoices — สร้าง invoice */
  @Post('invoices')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER)
  createInvoice(
    @Body() dto: CreateInvoiceDto,
    @Request() req: { user: RequestUser },
  ) {
    return this.billingService.createInvoice(dto, req.user);
  }

  /** GET /billing/invoices?customerId= */
  @Get('invoices')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.CUSTOMER_ADMIN, Role.CUSTOMER)
  listInvoices(
    @Request() req: { user: RequestUser },
    @Query('customerId') customerId?: string,
  ) {
    return this.billingService.listInvoices(req.user, customerId);
  }

  /** GET /billing/invoices/:id */
  @Get('invoices/:id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.CUSTOMER_ADMIN, Role.CUSTOMER)
  findInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.billingService.findInvoice(id, req.user);
  }

  /** PATCH /billing/invoices/:id/status */
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
