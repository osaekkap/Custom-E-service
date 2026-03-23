import {
  Controller, Get, Post, Patch, Body, Param,
  Query, UseGuards, Request, ParseUUIDPipe,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from './dto/billing.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestUser } from '../auth/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  /** GET /billing/items?invoiced=false */
  @Get('items')
  listItems(
    @Request() req: { user: RequestUser },
    @Query('invoiced') invoiced?: string,
  ) {
    return this.billingService.listItems(req.user, invoiced);
  }

  /** POST /billing/invoices — สร้าง invoice (SUPER_ADMIN only) */
  @Post('invoices')
  createInvoice(
    @Body() dto: CreateInvoiceDto,
    @Request() req: { user: RequestUser },
  ) {
    return this.billingService.createInvoice(dto, req.user);
  }

  /** GET /billing/invoices?customerId= */
  @Get('invoices')
  listInvoices(
    @Request() req: { user: RequestUser },
    @Query('customerId') customerId?: string,
  ) {
    return this.billingService.listInvoices(req.user, customerId);
  }

  /** GET /billing/invoices/:id */
  @Get('invoices/:id')
  findInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.billingService.findInvoice(id, req.user);
  }

  /** PATCH /billing/invoices/:id/status */
  @Patch('invoices/:id/status')
  updateInvoiceStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvoiceStatusDto,
    @Request() req: { user: RequestUser },
  ) {
    return this.billingService.updateInvoiceStatus(id, dto, req.user);
  }
}
