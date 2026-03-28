import {
  Controller, Get, Post, Delete,
  Body, Param, Query, UseGuards, Request,
  ParseUUIDPipe, HttpCode, HttpStatus,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrivilegeDocsService } from './privilege-docs.service';
import { UploadPrivilegeDocDto } from './dto/privilege-doc.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestUser } from '../auth/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('privilege-docs')
export class PrivilegeDocsController {
  constructor(private readonly service: PrivilegeDocsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Request() req: { user: RequestUser },
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadPrivilegeDocDto,
  ) {
    return this.service.upload(file, dto, req.user);
  }

  @Get()
  list(
    @Request() req: { user: RequestUser },
    @Query('privilegeType') privilegeType?: string,
  ) {
    return this.service.list(req.user.customerId, privilegeType);
  }

  @Get('by-item/:declarationItemId')
  listByItem(
    @Request() req: { user: RequestUser },
    @Param('declarationItemId', ParseUUIDPipe) declarationItemId: string,
  ) {
    return this.service.listByDeclarationItem(req.user.customerId, declarationItemId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Request() req: { user: RequestUser },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(req.user.customerId, id);
  }
}
