import {
  Controller, Get, Query, Request, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { RequestUser } from '../auth/jwt.strategy';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class QueryAuditDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(500)
  limit?: number = 100;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  skip?: number = 0;
}

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * GET /api/audit-logs
   * TENANT_ADMIN → ดู log ของบริษัทตัวเอง
   * SUPER_ADMIN   → ดู log ทั้งหมด
   */
  @ApiOperation({ summary: 'ดู audit logs — TENANT_ADMIN เห็นของบริษัทตัวเอง, SUPER_ADMIN เห็นทั้งหมด' })
  @ApiResponse({ status: 200, description: 'Audit log entries' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles(
    Role.SUPER_ADMIN,
    Role.TENANT_ADMIN,
    Role.MANAGER,
    Role.STAFF,
    Role.USER,
    Role.CUSTOMER_ADMIN,
  )
  @Get()
  getLogs(
    @Request() req: { user: RequestUser },
    @Query() query: QueryAuditDto,
  ) {
    const { limit = 100, skip = 0 } = query;

    // SUPER_ADMIN → all logs
    if (req.user.role === Role.SUPER_ADMIN) {
      return this.auditService.findAll(limit, skip);
    }

    // Factory users (CUSTOMER_ADMIN etc.) with customerId → their company's logs
    if (req.user.customerId) {
      return this.auditService.findByCustomer(req.user.customerId, limit, skip);
    }

    // Internal NKTech staff without customerId → their own actions only
    return this.auditService.findByActor(req.user.userId, limit, skip);
  }
}
