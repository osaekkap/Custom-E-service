import {
  Controller, Get, Post, Delete,
  Body, Param, Query, UseGuards, Request,
  ParseUUIDPipe, HttpCode, HttpStatus,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrivilegeDocsService } from './privilege-docs.service';
import { UploadPrivilegeDocDto } from './dto/privilege-doc.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { RequestUser } from '../auth/jwt.strategy';

@ApiTags('Privilege Docs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('privilege-docs')
export class PrivilegeDocsController {
  constructor(private readonly service: PrivilegeDocsService) {}

  @ApiOperation({ summary: 'อัปโหลดเอกสารสิทธิพิเศษ' })
  @ApiResponse({ status: 201, description: 'Privilege document uploaded' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  upload(
    @Request() req: { user: RequestUser },
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadPrivilegeDocDto,
  ) {
    return this.service.upload(file, dto, req.user);
  }

  @ApiOperation({ summary: 'รายการเอกสารสิทธิพิเศษทั้งหมด' })
  @ApiResponse({ status: 200, description: 'List of privilege documents' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER)
  list(
    @Request() req: { user: RequestUser },
    @Query('privilegeType') privilegeType?: string,
  ) {
    return this.service.list(req.user.customerId, privilegeType);
  }

  @ApiOperation({ summary: 'รายการเอกสารสิทธิพิเศษตาม declaration item' })
  @ApiResponse({ status: 200, description: 'List of privilege documents for declaration item' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('by-item/:declarationItemId')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER)
  listByItem(
    @Request() req: { user: RequestUser },
    @Param('declarationItemId', ParseUUIDPipe) declarationItemId: string,
  ) {
    return this.service.listByDeclarationItem(req.user.customerId, declarationItemId);
  }

  @ApiOperation({ summary: 'ลบเอกสารสิทธิพิเศษ' })
  @ApiResponse({ status: 200, description: 'Privilege document deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  remove(
    @Request() req: { user: RequestUser },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(req.user.customerId, id);
  }
}
