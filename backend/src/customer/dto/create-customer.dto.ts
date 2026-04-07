import {
  IsString, IsOptional, IsEmail, IsEnum, IsNumber,
  IsDecimal, MaxLength, MinLength, Matches,
} from 'class-validator';
import { BillingType } from '@prisma/client';

export class CreateCustomerDto {
  @IsString()
  @MaxLength(10)
  code: string;

  @IsString()
  @MaxLength(255)
  companyNameTh: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  companyNameEn?: string;

  @IsString()
  @MinLength(13)
  @MaxLength(15)
  @Matches(/^\d+$/, { message: 'taxId must be numeric' })
  taxId: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  postcode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  brokerName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  brokerTaxId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  agentCardNo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  agentName?: string;

  @IsOptional()
  @IsEnum(BillingType)
  billingType?: BillingType;

  @IsOptional()
  @IsNumber()
  termDays?: number;

  @IsOptional()
  pricePerJob?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  nswAgentCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  customsExporterId?: string;

  @IsOptional()
  @IsString()
  customsPasswordEnc?: string;
}
