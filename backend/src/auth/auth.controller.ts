import { Controller, Post, Get, Body, UseGuards, Request, Req, Ip, Headers, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterB2bDto } from './dto/register-b2b.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RequestUser } from './jwt.strategy';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** POST /api/auth/login — 5 attempts/min to prevent brute-force */
  @ApiOperation({ summary: 'เข้าสู่ระบบ — รับ access token และ refresh token' })
  @ApiResponse({ status: 200, description: 'Login successful, returns tokens' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') ua: string,
  ) {
    return this.authService.login(dto, ip, ua);
  }

  /** POST /api/auth/register — สร้าง user ใหม่สำหรับ customer (ต้อง login ก่อน) */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'สร้างบัญชีผู้ใช้ใหม่ภายในองค์กร (ต้องมี JWT)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /** POST /api/auth/register/b2b — สมัครใช้งานระบบสำหรับบริษัท (B2B) — 5 attempts/min */
  @ApiOperation({ summary: 'สมัครใช้งานระบบสำหรับบริษัท B2B พร้อมแนบเอกสาร' })
  @ApiResponse({ status: 201, description: 'B2B registration submitted successfully' })
  @Post('register/b2b')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'companyCert', maxCount: 1 },
    { name: 'pp20', maxCount: 1 },
  ]))
  registerB2b(
    @Body() dto: RegisterB2bDto,
    @Ip() ip: string,
    @UploadedFiles() files: { companyCert?: Express.Multer.File[], pp20?: Express.Multer.File[] },
  ) {
    return this.authService.registerB2b(dto, ip, files);
  }

  /** GET /api/auth/me — ดูข้อมูล user ปัจจุบัน */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ดูข้อมูลผู้ใช้ปัจจุบันจาก JWT token' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req: { user: RequestUser }) {
    return this.authService.getMe(req.user.userId, req.user.customerId);
  }

  /** POST /api/auth/refresh — exchange refresh token for new tokens */
  @ApiOperation({ summary: 'ต่ออายุ access token โดยใช้ refresh token' })
  @ApiResponse({ status: 200, description: 'New tokens issued' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @Post('refresh')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  refresh(@Body() dto: { refresh_token: string }) {
    return this.authService.refresh(dto.refresh_token);
  }

  /** POST /api/auth/logout — revoke refresh token */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ออกจากระบบ — ยกเลิก refresh token' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Body() dto: { refresh_token: string }) {
    return this.authService.logout(dto.refresh_token);
  }

  /** POST /api/auth/change-password */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'เปลี่ยนรหัสผ่าน' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized or wrong current password' })
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(
    @Request() req: { user: RequestUser },
    @Body() dto: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(req.user.userId, dto.currentPassword, dto.newPassword);
  }
}
