import { Module } from '@nestjs/common';
import { PrivilegeDocsController } from './privilege-docs.controller';
import { PrivilegeDocsService } from './privilege-docs.service';

@Module({
  controllers: [PrivilegeDocsController],
  providers: [PrivilegeDocsService],
  exports: [PrivilegeDocsService],
})
export class PrivilegeDocsModule {}
