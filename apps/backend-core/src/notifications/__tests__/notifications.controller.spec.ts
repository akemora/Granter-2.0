import { NotificationsController } from '../notifications.controller';
import { NotificationsService } from '../notifications.service';
import { GrantNotificationEntity } from '../../database/entities/grant-notification.entity';

describe('NotificationsController', () => {
  it('returns user-specific notifications with safe limit', async () => {
    const service = {
      getRecentForUser: jest.fn().mockResolvedValue([{ id: 'n1' } as GrantNotificationEntity]),
    } as unknown as NotificationsService;

    const controller = new NotificationsController(service);
    const result = await controller.getNotifications({ user: { id: 'user-1' } }, '200');

    expect(service.getRecentForUser).toHaveBeenCalledWith('user-1', 100);
    expect(result).toHaveLength(1);
  });

  it('uses default limit when query is invalid', async () => {
    const service = {
      getRecentForUser: jest.fn().mockResolvedValue([]),
    } as unknown as NotificationsService;

    const controller = new NotificationsController(service);
    await controller.getNotifications({ user: { id: 'user-1' } }, 'bad');

    expect(service.getRecentForUser).toHaveBeenCalledWith('user-1', 20);
  });
});
