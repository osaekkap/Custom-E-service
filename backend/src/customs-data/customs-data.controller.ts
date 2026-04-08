import { Controller, Get, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CustomsDataService } from './customs-data.service';

// Public endpoints (no auth) — used by Landing Page
@ApiTags('Customs Data')
@Controller('customs')
@Throttle({ default: { ttl: 60000, limit: 30 } })
export class CustomsDataController {
  constructor(private readonly customsDataService: CustomsDataService) {}

  @ApiOperation({ summary: 'ดูอัตราแลกเปลี่ยนเงินตราต่างประเทศ (public)' })
  @ApiResponse({ status: 200, description: 'Current exchange rates' })
  @Get('exchange-rates')
  getExchangeRates() {
    return this.customsDataService.getExchangeRates();
  }

  @ApiOperation({ summary: 'ดูข่าวสารศุลกากรล่าสุด (public)' })
  @ApiResponse({ status: 200, description: 'Latest customs news' })
  @Get('news')
  getNews(@Query('limit') limit?: string) {
    return this.customsDataService.getNews(
      limit ? parseInt(limit, 10) : 6,
    );
  }
}
