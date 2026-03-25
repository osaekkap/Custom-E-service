import { Module } from '@nestjs/common';
import { AiExtractionService } from './ai-extraction.service';
import { AiExtractionController } from './ai-extraction.controller';

@Module({
  controllers: [AiExtractionController],
  providers: [AiExtractionService],
  exports: [AiExtractionService],
})
export class AiModule {}
