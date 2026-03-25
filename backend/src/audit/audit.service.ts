import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditEntry {
  actorId?:    string;
  actorEmail?: string;
  customerId?: string | null;
  action:      string;   // e.g. LOGIN, CREATE_JOB, SUBMIT_DECLARATION
  entityType?: string;   // JOB, DECLARATION, CUSTOMER, USER, AUTH
  entityId?:   string;
  ipAddress?:  string;
  userAgent?:  string;
  detail?:     Prisma.InputJsonValue;
  status?:     'SUCCESS' | 'FAILED';
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** บันทึก audit log แบบ fire-and-forget (ไม่ block request) */
  log(entry: AuditEntry): void {
    this.prisma.auditLog
      .create({
        data: {
          actorId:    entry.actorId   ?? null,
          actorEmail: entry.actorEmail ?? null,
          customerId: entry.customerId ?? null,
          action:     entry.action,
          entityType: entry.entityType ?? null,
          entityId:   entry.entityId  ?? null,
          ipAddress:  entry.ipAddress  ?? null,
          userAgent:  entry.userAgent  ? entry.userAgent.substring(0, 500) : null,
          detail:     entry.detail    ?? undefined,
        },
      })
      .catch((err) => {
        // Never break the main request if audit fails
        this.logger.warn(`Audit log write failed: ${err?.message}`);
      });
  }

  /** ดึง audit logs สำหรับ customer (TENANT_ADMIN) */
  async findByCustomer(customerId: string, limit = 100, skip = 0) {
    const [rows, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      this.prisma.auditLog.count({ where: { customerId } }),
    ]);
    return { data: rows, total, limit, skip };
  }

  /** ดึง audit logs ของตัวเอง (actor) */
  async findByActor(actorId: string, limit = 100, skip = 0) {
    const [rows, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { actorId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      this.prisma.auditLog.count({ where: { actorId } }),
    ]);
    return { data: rows, total, limit, skip };
  }

  /** SUPER_ADMIN: ดึง audit logs ทั้งหมด */
  async findAll(limit = 100, skip = 0) {
    const [rows, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      this.prisma.auditLog.count(),
    ]);
    return { data: rows, total, limit, skip };
  }
}
