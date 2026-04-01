import { IsOptional, IsString, IsBoolean, IsInt, IsObject, MaxLength } from 'class-validator';

export class CreateCardDto {
  @IsOptional() @IsString() @MaxLength(50) icon?: string;
  @IsString() @MaxLength(300) title: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsString() @MaxLength(20) color?: string;
  @IsOptional() @IsObject() metadata?: Record<string, any>;
  @IsOptional() @IsBoolean() isVisible?: boolean;
  @IsOptional() @IsInt() sortOrder?: number;
}
