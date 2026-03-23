import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentType, Role } from '@prisma/client';
import { RequestUser } from '../auth/jwt.strategy';

const BUCKET = 'job-documents';

@Injectable()
export class DocumentsService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  constructor(private prisma: PrismaService) {}

  /** POST /jobs/:jobId/documents */
  async upload(
    jobId: string,
    file: Express.Multer.File,
    type: DocumentType,
    user: RequestUser,
  ) {
    const job = await this.assertJobAccess(jobId, user);

    // Build storage path: customerId/jobNo/filename
    const ext = file.originalname.split('.').pop();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${job.customerId}/${job.jobNo}/${Date.now()}_${safeName}`;

    const { error } = await this.supabase.storage
      .from(BUCKET)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw new BadRequestException(`Storage upload failed: ${error.message}`);

    // Generate a long-lived signed URL (1 year)
    const { data: signedData, error: signErr } = await this.supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

    if (signErr || !signedData)
      throw new BadRequestException('Failed to generate signed URL');

    const doc = await this.prisma.jobDocument.create({
      data: {
        jobId,
        customerId: job.customerId,
        type,
        fileName: file.originalname,
        fileUrl: signedData.signedUrl,
        fileSizeKb: Math.ceil(file.size / 1024),
        mimeType: file.mimetype,
        uploadedById: user.userId,
      },
    });

    return { ...doc, storagePath };
  }

  /** GET /jobs/:jobId/documents */
  async findAll(jobId: string, user: RequestUser) {
    await this.assertJobAccess(jobId, user);
    return this.prisma.jobDocument.findMany({
      where: { jobId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** DELETE /jobs/:jobId/documents/:docId */
  async remove(jobId: string, docId: string, user: RequestUser) {
    await this.assertJobAccess(jobId, user);

    const doc = await this.prisma.jobDocument.findUnique({ where: { id: docId } });
    if (!doc || doc.jobId !== jobId) throw new NotFoundException('Document not found');

    // Extract storage path from signed URL to delete from bucket
    // Path format: .../object/sign/job-documents/<path>?token=...
    try {
      const url = new URL(doc.fileUrl);
      const parts = url.pathname.split(`/object/sign/${BUCKET}/`);
      if (parts[1]) {
        const storagePath = parts[1].split('?')[0];
        await this.supabase.storage.from(BUCKET).remove([storagePath]);
      }
    } catch {
      // Ignore storage delete errors — DB record will still be removed
    }

    await this.prisma.jobDocument.delete({ where: { id: docId } });
    return { message: 'Document deleted' };
  }

  /** Refresh signed URL for a document */
  async refreshUrl(jobId: string, docId: string, user: RequestUser) {
    await this.assertJobAccess(jobId, user);

    const doc = await this.prisma.jobDocument.findUnique({ where: { id: docId } });
    if (!doc || doc.jobId !== jobId) throw new NotFoundException('Document not found');

    // Extract path and regenerate signed URL
    const url = new URL(doc.fileUrl);
    const parts = url.pathname.split(`/object/sign/${BUCKET}/`);
    if (!parts[1]) throw new BadRequestException('Cannot parse storage path');

    const storagePath = parts[1].split('?')[0];
    const { data, error } = await this.supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

    if (error || !data) throw new BadRequestException('Failed to refresh URL');

    const updated = await this.prisma.jobDocument.update({
      where: { id: docId },
      data: { fileUrl: data.signedUrl },
    });

    return updated;
  }

  // ─── Helper ─────────────────────────────────────────────────────

  private async assertJobAccess(jobId: string, user: RequestUser) {
    const job = await this.prisma.logisticsJob.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException(`Job ${jobId} not found`);
    if (user.role !== Role.SUPER_ADMIN && user.customerId !== job.customerId) {
      throw new ForbiddenException('Access denied');
    }
    return job;
  }
}
