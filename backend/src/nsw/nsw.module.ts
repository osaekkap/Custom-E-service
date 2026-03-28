import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { NswService } from './nsw.service';
import { XmlBuilderService } from './xml-builder.service';
import { EbxmlWrapperService } from './ebxml-wrapper.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [NswService, XmlBuilderService, EbxmlWrapperService],
  exports: [NswService, XmlBuilderService],
})
export class NswModule {}
