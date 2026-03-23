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
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestUser } from '../auth/jwt.strategy';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

@UseGuards(JwtAuthGuard)
@Controller('jobs/:jobId/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /** POST /jobs/:jobId/documents — multipart/form-data */
  @Post()
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
  @Get()
  findAll(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.documentsService.findAll(jobId, req.user);
  }

  /** PATCH /jobs/:jobId/documents/:docId/refresh — renew signed URL */
  @Patch(':docId/refresh')
  refreshUrl(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Param('docId', ParseUUIDPipe) docId: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.documentsService.refreshUrl(jobId, docId, req.user);
  }

  /** DELETE /jobs/:jobId/documents/:docId */
  @Delete(':docId')
  remove(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Param('docId', ParseUUIDPipe) docId: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.documentsService.remove(jobId, docId, req.user);
  }
}
