import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Register AuditInterceptor globally — logs every POST/PATCH/PUT/DELETE
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
