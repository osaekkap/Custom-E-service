import {
  IsString, IsOptional, IsEnum, IsUUID,
  IsDateString, IsNumber, MaxLength,
} from 'class-validator';
import { JobType, TransportMode } from '@prisma/client';

export class CreateJobDto {
  @IsEnum(JobType)
  type: JobType;

  @IsOptional()
  @IsEnum(TransportMode)
  transportMode?: TransportMode;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  vesselName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  voyageNo?: string;

  @IsOptional()
  @IsDateString()
  etd?: string;

  @IsOptional()
  @IsDateString()
  eta?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  portOfLoading?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  portOfLoadingCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  portOfDischarge?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  portOfReleaseCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  containerNo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  sealNo?: string;

  @IsOptional()
  @IsUUID()
  consigneeId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  consigneeNameEn?: string;

  @IsOptional()
  @IsString()
  consigneeAddr?: string;

  @IsOptional()
  @IsNumber()
  totalFobUsd?: number;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  currency?: string;
}
