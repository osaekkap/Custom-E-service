import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateThemeDto {
  @IsOptional() @IsString() @MaxLength(20) primary?: string;
  @IsOptional() @IsString() @MaxLength(20) primaryHover?: string;
  @IsOptional() @IsString() @MaxLength(20) accent?: string;
  @IsOptional() @IsString() @MaxLength(20) success?: string;
  @IsOptional() @IsString() @MaxLength(20) warning?: string;
  @IsOptional() @IsString() @MaxLength(20) danger?: string;
  @IsOptional() @IsString() @MaxLength(20) navy?: string;
  @IsOptional() @IsString() @MaxLength(20) navyMid?: string;
  @IsOptional() @IsString() @MaxLength(200) fontSans?: string;
  @IsOptional() @IsString() @MaxLength(200) fontMono?: string;
  @IsOptional() @IsString() @MaxLength(100) logoText?: string;
  @IsOptional() @IsString() @MaxLength(10) logoIcon?: string;
  @IsOptional() @IsString() @MaxLength(200) companyName?: string;
}
