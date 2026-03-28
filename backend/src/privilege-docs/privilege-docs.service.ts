import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';
import { UploadPrivilegeDocDto } from './dto/privilege-doc.dto';
import { RequestUser } from '../auth/jwt.strategy';

const BUCKET = 'privilege-documents';

@Injectable()
export class PrivilegeDocsService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  constructor(private prisma: PrismaService) {}

  async upload(
    file: Express.Multer.File,
    dto: UploadPrivilegeDocDto,
    user: RequestUser,
  ) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${user.customerId}/${dto.privilegeType}/${Date.now()}_${safeName}`;

    const { error } = await this.supabase.storage
      .from(BUCKET)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw new BadRequestException(`Storage upload failed: ${error.message}`);

    const { data: signedData, error: signErr } = await this.supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

    if (signErr || !signedData)
      throw new BadRequestException('Failed to generate signed URL');

    return this.prisma.privilegeDocument.create({
      data: {
        customerId: user.customerId,
        privilegeType: dto.privilegeType,
        licenseNumber: dto.licenseNumber,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
        declarationItemId: dto.declarationItemId || undefined,
        fileName: file.originalname,
        fileUrl: signedData.signedUrl,
        fileSizeKb: Math.ceil(file.size / 1024),
        mimeType: file.mimetype,
        uploadedById: user.userId,
      },
    });
  }

  async list(customerId: string, privilegeType?: string) {
    return this.prisma.privilegeDocument.findMany({
      where: {
        customerId,
        ...(privilegeType && { privilegeType }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listByDeclarationItem(customerId: string, declarationItemId: string) {
    return this.prisma.privilegeDocument.findMany({
      where: { customerId, declarationItemId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(customerId: string, id: string) {
    const doc = await this.prisma.privilegeDocument.findFirst({
      where: { id, customerId },
    });
    if (!doc) throw new NotFoundException(`Privilege document ${id} not found`);

    // Delete from Supabase Storage
    try {
      const url = new URL(doc.fileUrl);
      const parts = url.pathname.split(`/object/sign/${BUCKET}/`);
      if (parts[1]) {
        const storagePath = parts[1].split('?')[0];
        await this.supabase.storage.from(BUCKET).remove([storagePath]);
      }
    } catch {
      // Ignore storage delete errors
    }

    await this.prisma.privilegeDocument.delete({ where: { id } });
    return { message: 'Privilege document deleted' };
  }
}
