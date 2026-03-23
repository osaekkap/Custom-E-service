import {
  IsString, IsOptional, IsEnum, IsNumber, IsInt, IsDateString, MaxLength,
} from 'class-validator';
import { DeclarationType, TransportMode, SubmissionMethod } from '@prisma/client';

export class CreateDeclarationDto {
  @IsOptional()
  @IsEnum(DeclarationType)
  declarationType?: DeclarationType;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  invoiceRef?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  agentCardNo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  agentName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  brokerName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  brokerTaxId?: string;

  @IsOptional()
  @IsEnum(TransportMode)
  transportMode?: TransportMode;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  portOfReleaseCode?: string;

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
  @MaxLength(5)
  soldToCountryCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  destinationCode?: string;

  @IsOptional()
  @IsInt()
  totalPackages?: number;

  @IsOptional()
  @IsNumber()
  exchangeRate?: number;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  exchangeCurrency?: string;

  @IsOptional()
  @IsDateString()
  exchangeRateDate?: string;

  @IsOptional()
  @IsString()
  signatoryName?: string;

  @IsOptional()
  @IsEnum(SubmissionMethod)
  submissionMethod?: SubmissionMethod;
}
