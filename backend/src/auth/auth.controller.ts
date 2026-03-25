import { Controller, Post, Get, Body, UseGuards, Request, Req, Ip, Headers, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterB2bDto } from './dto/register-b2b.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RequestUser } from './jwt.strategy';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** POST /api/auth/login */
  @Post('login')
  login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') ua: string,
  ) {
    return this.authService.login(dto, ip, ua);
  }

  /** POST /api/auth/register — สร้าง user ใหม่สำหรับ customer (ต้อง login ก่อน) */
  @UseGuards(JwtAuthGuard)
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /** POST /api/auth/register/b2b — สมัครใช้งานระบบสำหรับบริษัท (B2B) */
  @Post('register/b2b')
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
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req: { user: RequestUser }) {
    return this.authService.getMe(req.user.userId, req.user.customerId);
  }

  /** POST /api/auth/change-password */
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(
    @Request() req: { user: RequestUser },
    @Body() dto: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(req.user.userId, dto.currentPassword, dto.newPassword);
  }
}
