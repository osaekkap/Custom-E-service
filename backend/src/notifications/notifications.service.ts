import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  /** Create a notification for a specific user */
  async create(data: {
    recipientId: string;
    type: NotificationType;
    title: string;
    message: string;
    entityType?: string;
    entityId?: string;
  }) {
    return this.prisma.notification.create({ data });
  }

  /** Create notifications for multiple recipients */
  async createMany(
    recipientIds: string[],
    data: {
      type: NotificationType;
      title: string;
      message: string;
      entityType?: string;
      entityId?: string;
    },
  ) {
    if (recipientIds.length === 0) return;
    return this.prisma.notification.createMany({
      data: recipientIds.map((recipientId) => ({
        recipientId,
        ...data,
      })),
    });
  }

  /** Get notifications for the current user (paginated, newest first) */
  async findAll(userId: string, query: { page?: number; limit?: number; unreadOnly?: boolean }) {
    const { page = 1, limit = 20, unreadOnly } = query;
    const skip = (page - 1) * limit;

    const where = {
      recipientId: userId,
      ...(unreadOnly ? { isRead: false } : {}),
    };

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { recipientId: userId, isRead: false },
      }),
    ]);

    return {
      data,
      unreadCount,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Get unread count only (lightweight for polling) */
  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { recipientId: userId, isRead: false },
    });
    return { unreadCount: count };
  }

  /** Mark a single notification as read */
  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, recipientId: userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /** Mark all notifications as read */
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  // ─── Helper: notify all staff in a customer's company ──────────
  async notifyCustomerUsers(
    customerId: string,
    data: {
      type: NotificationType;
      title: string;
      message: string;
      entityType?: string;
      entityId?: string;
    },
  ) {
    const users = await this.prisma.customerUser.findMany({
      where: { customerId },
      select: { profileId: true },
    });
    const recipientIds = users.map((u) => u.profileId);
    return this.createMany(recipientIds, data);
  }

  // ─── Helper: notify NKTech internal staff ──────────────────────
  async notifyInternalStaff(data: {
    type: NotificationType;
    title: string;
    message: string;
    entityType?: string;
    entityId?: string;
  }) {
    // Find all internal users (those without a customerId link, or with internal roles)
    const users = await this.prisma.customerUser.findMany({
      where: {
        customer: {
          code: { in: ['NKTECH'] }, // NKTech company code
        },
      },
      select: { profileId: true },
    });
    // Fallback: if NKTECH not found, just skip
    if (users.length === 0) return;
    const recipientIds = users.map((u) => u.profileId);
    return this.createMany(recipientIds, data);
  }
}
