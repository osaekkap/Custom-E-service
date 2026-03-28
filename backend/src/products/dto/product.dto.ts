import { IsString, IsOptional, IsBoolean, IsNumber, MaxLength } from 'class-validator';

export class CreateProductDto {
  @IsString() @MaxLength(50)
  productCode: string;

  @IsString() @MaxLength(500)
  descriptionEn: string;

  @IsOptional() @IsString() @MaxLength(500)
  descriptionTh?: string;

  @IsOptional() @IsString() @MaxLength(20)
  hsCode?: string;

  @IsOptional() @IsString() @MaxLength(200)
  brandName?: string;

  @IsOptional() @IsString() @MaxLength(5)
  originCountry?: string;

  @IsOptional() @IsString() @MaxLength(10)
  defaultUnit?: string;

  @IsOptional() @IsNumber()
  defaultPrice?: number;

  @IsOptional() @IsString() @MaxLength(5)
  defaultCurrency?: string;
}

export class UpdateProductDto {
  @IsOptional() @IsString() @MaxLength(500)
  descriptionEn?: string;

  @IsOptional() @IsString() @MaxLength(500)
  descriptionTh?: string;

  @IsOptional() @IsString() @MaxLength(20)
  hsCode?: string;

  @IsOptional() @IsString() @MaxLength(200)
  brandName?: string;

  @IsOptional() @IsString() @MaxLength(5)
  originCountry?: string;

  @IsOptional() @IsString() @MaxLength(10)
  defaultUnit?: string;

  @IsOptional() @IsNumber()
  defaultPrice?: number;

  @IsOptional() @IsString() @MaxLength(5)
  defaultCurrency?: string;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
