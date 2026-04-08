import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { RequestUser } from '../auth/jwt.strategy';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('jobs/:jobId/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /** POST /jobs/:jobId/documents — multipart/form-data */
  @ApiOperation({ summary: 'อัปโหลดเอกสารสำหรับ job (multipart/form-data)' })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or missing file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER, Role.CUSTOMER_ADMIN, Role.CUSTOMER)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        const allowed = [
          'application/pdf',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'image/jpeg',
          'image/png',
          'text/csv',
        ];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException(`File type ${file.mimetype} not allowed`), false);
        }
      },
    }),
  )
  upload(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @Request() req: { user: RequestUser },
  ) {
    if (!file) throw new BadRequestException('File is required');
    return this.documentsService.upload(jobId, file, dto.type, req.user);
  }

  /** GET /jobs/:jobId/documents */
  @ApiOperation({ summary: 'รายการเอกสารทั้งหมดของ job' })
  @ApiResponse({ status: 200, description: 'List of documents for the job' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  findAll(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.documentsService.findAll(jobId, req.user);
  }

  /** PATCH /jobs/:jobId/documents/:docId/refresh — renew signed URL */
  @ApiOperation({ summary: 'ต่ออายุ signed URL ของเอกสาร' })
  @ApiResponse({ status: 200, description: 'Signed URL refreshed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @Patch(':docId/refresh')
  refreshUrl(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Param('docId', ParseUUIDPipe) docId: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.documentsService.refreshUrl(jobId, docId, req.user);
  }

  /** DELETE /jobs/:jobId/documents/:docId */
  @ApiOperation({ summary: 'ลบเอกสารออกจาก job' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @Delete(':docId')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER)
  remove(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Param('docId', ParseUUIDPipe) docId: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.documentsService.remove(jobId, docId, req.user);
  }
}
