import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RequestUser } from './jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** POST /api/auth/login */
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /** POST /api/auth/register — สร้าง user ใหม่สำหรับ customer (ต้อง login ก่อน) */
  @UseGuards(JwtAuthGuard)
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /** GET /api/auth/me — ดูข้อมูล user ปัจจุบัน */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req: { user: RequestUser }) {
    return this.authService.getMe(req.user.userId, req.user.customerId);
  }
}
