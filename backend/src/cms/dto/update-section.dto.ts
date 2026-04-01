import { IsOptional, IsString, IsBoolean, IsInt, IsObject, MaxLength, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSectionDto {
  @IsOptional() @IsString() @MaxLength(300) title?: string;
  @IsOptional() @IsString() @MaxLength(1000) subtitle?: string;
  @IsOptional() @IsString() @MaxLength(100) tagText?: string;
  @IsOptional() @IsString() @MaxLength(20) tagColor?: string;
  @IsOptional() @IsBoolean() isVisible?: boolean;
  @IsOptional() @IsInt() sortOrder?: number;
  @IsOptional() @IsObject() metadata?: Record<string, any>;
}

class ReorderItem {
  @IsUUID() id: string;
  @IsInt() sortOrder: number;
}

export class ReorderSectionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItem)
  items: ReorderItem[];
}

export class ReorderCardsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItem)
  items: ReorderItem[];
}
