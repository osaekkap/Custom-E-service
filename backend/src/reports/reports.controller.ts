import {
  Controller, Get, Query, Request, UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { RequestUser } from '../auth/jwt.strategy';

const INTERNAL_ROLES = [
  Role.SUPER_ADMIN,
  Role.TENANT_ADMIN,
  Role.MANAGER,
  Role.STAFF,
] as const;

function resolveCustomerId(
  user: RequestUser,
  queryCustomerId?: string,
): string {
  const isInternal = (INTERNAL_ROLES as readonly string[]).includes(user.role);
  const customerId = isInternal
    ? (queryCustomerId || user.customerId)
    : user.customerId;
  return customerId;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /** GET /reports/monthly-summary?months=6&customerId= */
  @Get('monthly-summary')
  @Roles(
    Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF,
    Role.CUSTOMER_ADMIN, Role.CUSTOMER,
  )
  getMonthlySummary(
    @Request() req: { user: RequestUser },
    @Query('months') months?: string,
    @Query('customerId') customerId?: string,
  ) {
    const resolvedCustomerId = resolveCustomerId(req.user, customerId);
    const monthCount = months ? parseInt(months, 10) : 6;
    return this.reportsService.getMonthlySummary(resolvedCustomerId, monthCount);
  }

  /** GET /reports/top-destinations?months=3&customerId= */
  @Get('top-destinations')
  @Roles(
    Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF,
    Role.CUSTOMER_ADMIN, Role.CUSTOMER,
  )
  getTopDestinations(
    @Request() req: { user: RequestUser },
    @Query('months') months?: string,
    @Query('customerId') customerId?: string,
  ) {
    const resolvedCustomerId = resolveCustomerId(req.user, customerId);
    const monthCount = months ? parseInt(months, 10) : 3;
    return this.reportsService.getTopDestinations(resolvedCustomerId, monthCount);
  }
}
