import {
  Controller, Get, Patch, Param,
  Query, UseGuards, Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestUser } from '../auth/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  /** GET /notifications — list notifications for current user */
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('unreadOnly') unreadOnly?: string,
    @Request() req?: { user: RequestUser },
  ) {
    return this.svc.findAll(req!.user.userId, {
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      unreadOnly: unreadOnly === 'true',
    });
  }

  /** GET /notifications/unread-count — lightweight poll endpoint */
  @Get('unread-count')
  getUnreadCount(@Request() req: { user: RequestUser }) {
    return this.svc.getUnreadCount(req.user.userId);
  }

  /** PATCH /notifications/:id/read — mark single as read */
  @Patch(':id/read')
  markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.svc.markAsRead(id, req.user.userId);
  }

  /** PATCH /notifications/read-all — mark all as read */
  @Patch('read-all')
  markAllAsRead(@Request() req: { user: RequestUser }) {
    return this.svc.markAllAsRead(req.user.userId);
  }
}
