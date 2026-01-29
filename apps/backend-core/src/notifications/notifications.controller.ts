import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { GrantNotificationEntity } from '../database/entities/grant-notification.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(
    @Request() req: { user: { id: string } },
    @Query('limit') limit?: string,
  ): Promise<GrantNotificationEntity[]> {
    const parsed = Number(limit);
    const safeLimit = Number.isFinite(parsed) && parsed > 0 ? parsed : 20;
    return this.notificationsService.getRecentForUser(req.user.id, Math.min(safeLimit, 100));
  }
}
