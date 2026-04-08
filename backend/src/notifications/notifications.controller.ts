import {
  Controller, Get, Patch, Param,
  Query, UseGuards, Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestUser } from '../auth/jwt.strategy';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  /** GET /notifications — list notifications for current user */
  @ApiOperation({ summary: 'รายการการแจ้งเตือนของผู้ใช้ปัจจุบัน' })
  @ApiResponse({ status: 200, description: 'List of notifications' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'จำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน' })
  @ApiResponse({ status: 200, description: 'Unread notification count' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('unread-count')
  getUnreadCount(@Request() req: { user: RequestUser }) {
    return this.svc.getUnreadCount(req.user.userId);
  }

  /** PATCH /notifications/:id/read — mark single as read */
  @ApiOperation({ summary: 'ทำเครื่องหมายการแจ้งเตือนว่าอ่านแล้ว' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Patch(':id/read')
  markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.svc.markAsRead(id, req.user.userId);
  }

  /** PATCH /notifications/read-all — mark all as read */
  @ApiOperation({ summary: 'ทำเครื่องหมายการแจ้งเตือนทั้งหมดว่าอ่านแล้ว' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Patch('read-all')
  markAllAsRead(@Request() req: { user: RequestUser }) {
    return this.svc.markAllAsRead(req.user.userId);
  }
}
