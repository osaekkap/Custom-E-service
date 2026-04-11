import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateBrokerDto {
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
  @MaxLength(6)
  branch?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  agentCardNo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  agentName?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateBrokerDto extends PartialType(CreateBrokerDto) {}
