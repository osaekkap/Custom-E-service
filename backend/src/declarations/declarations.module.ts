import { Module } from '@nestjs/common';
import { DeclarationsController } from './declarations.controller';
import { DeclarationsService } from './declarations.service';
import { NswModule } from '../nsw/nsw.module';

@Module({
  imports: [NswModule],
  controllers: [DeclarationsController],
  providers: [DeclarationsService],
  exports: [DeclarationsService],
})
export class DeclarationsModule {}
