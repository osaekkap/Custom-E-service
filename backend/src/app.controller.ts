import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @ApiOperation({ summary: 'Root endpoint' })
  @ApiResponse({ status: 200, description: 'Returns hello message' })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiOperation({ summary: 'Health check — ตรวจสอบสถานะระบบและฐานข้อมูล' })
  @ApiResponse({ status: 200, description: 'System health status' })
  @Get('health')
  async healthCheck() {
    let dbOk = false;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch {}
    return {
      status: dbOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: { database: dbOk ? 'connected' : 'disconnected' },
    };
  }

  @ApiOperation({ summary: 'HS Code debug check' })
  @Get('hs-check')
  async hsCheck() {
    const counts = await this.prisma.hsMasterItem.groupBy({
      by: ['customerId'],
      _count: { id: true },
    });
    
    const customers = await this.prisma.customer.findMany({
      select: { id: true, code: true, companyNameEn: true }
    });

    return {
      total: counts.reduce((acc, c) => acc + c._count.id, 0),
      byCustomer: counts.map(c => ({
        customerId: c.customerId,
        customerCode: customers.find(cust => cust.id === c.customerId)?.code,
        count: c._count.id
      }))
    };
  }
}
