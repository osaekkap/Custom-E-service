import { IsEmail, IsString, MinLength, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  fullName: string;

  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
