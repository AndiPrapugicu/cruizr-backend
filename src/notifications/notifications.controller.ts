import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    email: string;
    name: string;
  };
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Request() req: AuthenticatedRequest) {
    return await this.notificationsService.getUserNotifications(
      req.user.userId,
    );
  }

  @Get('unread')
  async getUnreadNotifications(@Request() req: AuthenticatedRequest) {
    return await this.notificationsService.getUnreadNotifications(
      req.user.userId,
    );
  }

  @Get('unread/count')
  async getUnreadCount(@Request() req: AuthenticatedRequest) {
    const count = await this.notificationsService.getUnreadCount(
      req.user.userId,
    );
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.notificationsService.markAsRead(id, req.user.userId);
    return { success: true };
  }

  @Patch('read-all')
  async markAllAsRead(@Request() req: AuthenticatedRequest) {
    await this.notificationsService.markAllAsRead(req.user.userId);
    return { success: true };
  }

  @Delete(':id')
  async deleteNotification(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.notificationsService.deleteNotification(id, req.user.userId);
    return { success: true };
  }
}
