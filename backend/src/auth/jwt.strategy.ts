import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;        // user id (Supabase auth.uid)
  email: string;
  role: string;
  customer_id: string;  // injected from Supabase JWT claim
  iat?: number;
  exp?: number;
}

export interface RequestUser {
  userId: string;
  email: string;
  role: string;
  customerId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? '',
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    if (!payload.customer_id && payload.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('No customer context in token');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      customerId: payload.customer_id,
    };
  }
}
