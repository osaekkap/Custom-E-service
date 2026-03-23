import { IsString, IsOptional, IsBoolean, IsDateString, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreatePrivilegeDto {
  @IsString()
  @MaxLength(50)
  code: string;

  @IsString()
  @MaxLength(255)
  nameTh: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameEn?: string;

  @IsString()
  @MaxLength(50)
  type: string; // IEAT | BOI | FreeZone

  @IsOptional()
  @IsString()
  @MaxLength(255)
  taxBenefit?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  refNumber?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}

export class UpdatePrivilegeDto extends PartialType(CreatePrivilegeDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
