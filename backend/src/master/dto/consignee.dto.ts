import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateConsigneeDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameTh?: string;

  @IsString()
  @MaxLength(255)
  nameEn: string;

  @IsString()
  @MaxLength(100)
  country: string;

  @IsString()
  @MaxLength(5)
  countryCode: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateConsigneeDto extends PartialType(CreateConsigneeDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
