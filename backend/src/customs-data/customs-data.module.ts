import { Module } from '@nestjs/common';
import { CustomsDataController } from './customs-data.controller';
import { CustomsDataService } from './customs-data.service';

@Module({
  controllers: [CustomsDataController],
  providers: [CustomsDataService],
  exports: [CustomsDataService],
})
export class CustomsDataModule {}
