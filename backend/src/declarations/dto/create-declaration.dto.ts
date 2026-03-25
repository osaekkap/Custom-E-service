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

  // ── AuthorisedPerson ──────────────────────────────────────────────
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
  @MaxLength(17)
  managerIdCard?: string;

  @IsOptional()
  @IsString()
  @MaxLength(35)
  managerName?: string;

  // ── Agent/Broker ─────────────────────────────────────────────────
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
  @MaxLength(6)
  agentBranch?: string;

  // ── Exporter (overrides auto-populated from master) ───────────────
  @IsOptional()
  @IsString()
  @MaxLength(17)
  exporterTaxId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(6)
  exporterBranch?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  exporterNameTh?: string;

  @IsOptional()
  @IsString()
  @MaxLength(70)
  exporterNameEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(70)
  exporterAddress?: string;

  // ── Transport ────────────────────────────────────────────────────
  @IsOptional()
  @IsEnum(TransportMode)
  transportMode?: TransportMode;

  @IsOptional()
  @IsString()
  @MaxLength(1)
  cargoTypeCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(35)
  vesselName?: string;

  @IsOptional()
  @IsDateString()
  departureDate?: string;

  // ── Port ─────────────────────────────────────────────────────────
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

  // ── Bill of Lading ───────────────────────────────────────────────
  @IsOptional()
  @IsString()
  @MaxLength(35)
  masterBl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(35)
  houseBl?: string;

  // ── Package & Weight ─────────────────────────────────────────────
  @IsOptional()
  @IsInt()
  totalPackages?: number;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  shippingMarks?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  packageUnitCode?: string;

  @IsOptional()
  @IsNumber()
  totalNetWeight?: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  netWeightUnit?: string;

  @IsOptional()
  @IsNumber()
  totalGrossWeight?: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  grossWeightUnit?: string;

  // ── FOB & Exchange ───────────────────────────────────────────────
  @IsOptional()
  @IsNumber()
  totalFobForeign?: number;

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

  // ── Financial ────────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  @MaxLength(1)
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1)
  guaranteeMethod?: string;

  // ── NSW / Reference ──────────────────────────────────────────────
  @IsOptional()
  @IsString()
  @MaxLength(13)
  nswReferenceNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1)
  declarationDocType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(35)
  nswRegistrationId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(17)
  exportTaxIncentivesId?: string;

  // ── Signatory ────────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  signatoryName?: string;

  @IsOptional()
  @IsEnum(SubmissionMethod)
  submissionMethod?: SubmissionMethod;
}
