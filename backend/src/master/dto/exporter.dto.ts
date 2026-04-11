import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateExporterDto {
  @IsString()
  @MaxLength(255)
  nameTh: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameEn?: string;

  @IsString()
  @MaxLength(15)
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
  @IsString()
  @MaxLength(255)
  agentName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  agentCardNo?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateExporterDto extends PartialType(CreateExporterDto) {}
