import * as fs from 'fs';
import * as path from 'path';
// Force-load .env before NestJS starts — overrides empty shell env vars
(function loadEnvOverride() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 1) continue;
    const key = trimmed.substring(0, eqIdx).trim();
    let val = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    // Always override — even empty shell vars
    process.env[key] = val;
  }
})();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers (X-Frame-Options, CSP, X-Content-Type-Options, etc.)
  app.use(helmet());

  // Fail fast: production MUST have FRONTEND_URL
  const isDev = process.env.NODE_ENV !== 'production';
  if (!isDev && !process.env.FRONTEND_URL) {
    throw new Error('FRONTEND_URL env var is required in production');
  }

  // Support comma-separated origins e.g. "https://app.example.com,http://localhost:5173"
  const rawOrigins = process.env.FRONTEND_URL ?? 'http://localhost:5173';
  const allowedOrigins = rawOrigins.split(',').map((o) => o.trim());
  app.enableCors({
    origin: (origin, cb) => {
      // Allow non-browser clients (Postman, server-to-server)
      if (!origin) return cb(null, true);
      // In dev: allow any localhost port (Vite may use 5173, 5174, 5175…)
      if (isDev && /^http:\/\/localhost:\d+$/.test(origin)) return cb(null, true);
      // Production: check explicit allow-list
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // strip unknown properties
      forbidNonWhitelisted: true, // reject requests with unknown properties
      transform: true,           // auto-transform query params to correct types
    }),
  );

  app.setGlobalPrefix('api');

  // Swagger API documentation (available at /api/docs)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Customs E-Service API')
    .setDescription('NKTech Customs E-Service — Multi-tenant logistics & customs declaration platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
