import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CustomerModule } from './customer/customer.module';
import { JobsModule } from './jobs/jobs.module';
import { MasterModule } from './master/master.module';
import { DeclarationsModule } from './declarations/declarations.module';
import { BillingModule } from './billing/billing.module';
import { DocumentsModule } from './documents/documents.module';
import { AuditModule } from './audit/audit.module';
import { AuditInterceptor } from './audit/audit.interceptor';
import { AiModule } from './ai/ai.module';
import { ProductsModule } from './products/products.module';
import { PrivilegeDocsModule } from './privilege-docs/privilege-docs.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CustomsDataModule } from './customs-data/customs-data.module';
import { CmsModule } from './cms/cms.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        SUPABASE_URL: Joi.string().uri().required(),
        SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
        PORT: Joi.number().default(3000),
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        FRONTEND_URL: Joi.string().when('NODE_ENV', { is: 'production', then: Joi.required() }),
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    PrismaModule,
    AuthModule,
    CustomerModule,
    JobsModule,
    MasterModule,
    DeclarationsModule,
    BillingModule,
    DocumentsModule,
    AuditModule,
    AiModule,
    ProductsModule,
    PrivilegeDocsModule,
    NotificationsModule,
    CustomsDataModule,
    CmsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global rate limiting — 60 req/min default (overridable per endpoint with @Throttle)
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Register AuditInterceptor globally — logs every POST/PATCH/PUT/DELETE
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
