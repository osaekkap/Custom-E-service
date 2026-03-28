import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UploadPrivilegeDocDto {
  @IsString() @MaxLength(20)
  privilegeType: string;  // BOI, IEAT, FZ, 29BIS, REEXPORT, REIMPORT

  @IsOptional() @IsString() @MaxLength(100)
  licenseNumber?: string;

  @IsOptional() @IsString()
  expiryDate?: string;  // ISO date string

  @IsOptional() @IsString()
  declarationItemId?: string;
}
