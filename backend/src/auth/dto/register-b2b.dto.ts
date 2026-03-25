import {
  IsString, IsEmail, IsOptional, IsBoolean, MinLength,
  MaxLength, Matches, IsNotEmpty, IsIn,
} from 'class-validator';

export class RegisterB2bDto {
  // ── Company Information ───────────────────────────────────────────
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  companyNameTh: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  companyNameEn?: string;

  /** เลขประจำตัวผู้เสียภาษีอากร 13 หลัก */
  @IsString()
  @Matches(/^\d{13}$/, { message: 'taxId must be 13 digits' })
  taxId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  postcode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  companyPhone?: string;

  // ── Administrator Account ─────────────────────────────────────────
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'password must contain uppercase, lowercase, and number',
  })
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  jobTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  adminPhone?: string;

  // ── Legal Consent ────────────────────────────────────────────────
  /** ผู้ใช้ยอมรับ Terms & Conditions */
  @IsBoolean()
  @IsIn([true], { message: 'You must accept the Terms and Conditions' })
  tcAccepted: boolean;

  /** ผู้ใช้ยอมรับ PDPA */
  @IsBoolean()
  @IsIn([true], { message: 'You must accept the PDPA Privacy Policy' })
  pdpaAccepted: boolean;

  /** เวอร์ชัน T&C ที่ยอมรับ */
  @IsString()
  tcVersion: string;
}
