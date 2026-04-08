import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { AiExtractionService } from './ai-extraction.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
]);

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiExtractionController {
  constructor(private readonly aiService: AiExtractionService) {}

  /**
   * POST /api/ai/extract-invoice
   * Body: multipart/form-data with fields: invoice, packingList (opt), booking (opt)
   */
  @ApiOperation({ summary: 'สกัดข้อมูลจากเอกสาร invoice/packing list ด้วย AI' })
  @ApiResponse({ status: 201, description: 'Extracted data from documents' })
  @ApiResponse({ status: 400, description: 'Invalid file type or missing required files' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('extract-invoice')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'invoice', maxCount: 1 },
        { name: 'packingList', maxCount: 1 },
        { name: 'booking', maxCount: 1 },
      ],
      {
        storage: multer.memoryStorage(),
        limits: { fileSize: MAX_SIZE },
        fileFilter: (_req, file, cb) => {
          if (ALLOWED_MIME.has(file.mimetype)) {
            cb(null, true);
          } else {
            cb(
              new BadRequestException(
                `File type ${file.mimetype} not allowed. Use PDF, Excel, or CSV.`,
              ),
              false,
            );
          }
        },
      },
    ),
  )
  async extractInvoice(
    @UploadedFiles()
    files: {
      invoice?: Express.Multer.File[];
      packingList?: Express.Multer.File[];
      booking?: Express.Multer.File[];
    },
  ) {
    return this.aiService.extractFromDocuments({
      invoice: files.invoice?.[0],
      packingList: files.packingList?.[0],
      booking: files.booking?.[0],
    });
  }
}
