import { IsString, IsOptional, IsEnum, IsDateString, IsArray, IsUUID } from 'class-validator';
import { InvoiceStatus } from '@prisma/client';

export class CreateInvoiceDto {
  @IsString()
  customerId: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  billingItemIds: string[]; // BillingItem ids to include

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsDateString()
  periodStart?: string;

  @IsOptional()
  @IsDateString()
  periodEnd?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateInvoiceStatusDto {
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;

  @IsOptional()
  @IsDateString()
  paidAt?: string;
}
