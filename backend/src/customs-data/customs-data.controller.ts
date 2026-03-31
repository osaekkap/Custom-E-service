import { Controller, Get, Query } from '@nestjs/common';
import { CustomsDataService } from './customs-data.service';

@Controller('customs')
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
