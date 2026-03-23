import { IsString, IsOptional, IsBoolean, IsNumber, MaxLength, Min, Max } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateHsCodeDto {
  @IsString()
  @MaxLength(20)
  hsCode: string;

  @IsString()
  @MaxLength(500)
  descriptionEn: string;

  @IsString()
  @MaxLength(500)
  descriptionTh: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  statisticsCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  statisticsUnit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(9.9999)
  dutyRate?: number;

  @IsOptional()
  @IsBoolean()
  isControlled?: boolean;
}

export class UpdateHsCodeDto extends PartialType(CreateHsCodeDto) {}
