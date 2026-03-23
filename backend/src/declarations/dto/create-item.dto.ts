import {
  IsString, IsOptional, IsNumber, IsInt, IsDateString, MaxLength, Min,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateDeclarationItemDto {
  @IsInt()
  @Min(1)
  seqNo: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  packageMark?: string;

  @IsOptional()
  @IsInt()
  packageQty?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  packageType?: string;

  @IsString()
  @MaxLength(500)
  descriptionEn: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descriptionTh?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  brandName?: string;

  @IsOptional()
  @IsNumber()
  netWeightKg?: number;

  @IsNumber()
  quantity: number;

  @IsString()
  @MaxLength(20)
  quantityUnit: string;

  @IsString()
  @MaxLength(20)
  hsCode: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  statisticsCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  statisticsUnit?: string;

  @IsNumber()
  fobForeign: number;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  fobCurrency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  privilegeCode?: string;

  @IsOptional()
  @IsNumber()
  dutyRate?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  exportLicenseNo?: string;

  @IsOptional()
  @IsDateString()
  exportLicenseExpiry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  sourceInvoiceNo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sourceProductCode?: string;
}

export class UpdateDeclarationItemDto extends PartialType(CreateDeclarationItemDto) {}
