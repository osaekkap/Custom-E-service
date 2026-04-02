import { Controller, Get, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CustomsDataService } from './customs-data.service';

// Public endpoints (no auth) — used by Landing Page
@Controller('customs')
@Throttle({ default: { ttl: 60000, limit: 30 } })
export class CustomsDataController {
  constructor(private readonly customsDataService: CustomsDataService) {}

  @Get('exchange-rates')
  getExchangeRates() {
    return this.customsDataService.getExchangeRates();
  }

  @Get('news')
  getNews(@Query('limit') limit?: string) {
    return this.customsDataService.getNews(
      limit ? parseInt(limit, 10) : 6,
    );
  }
}
