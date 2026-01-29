import { ProfileController } from '../profile.controller';
import { ProfileService } from '../profile.service';
import { UserProfileEntity } from '../../database/entities/user-profile.entity';

describe('ProfileController', () => {
  it('returns profile for user', async () => {
    const service = {
      getProfile: jest.fn().mockResolvedValue({ id: 'p1' } as UserProfileEntity),
      updateProfile: jest.fn(),
    } as unknown as ProfileService;

    const controller = new ProfileController(service);
    const result = await controller.getProfile({ user: { id: 'user-1' } });

    expect(service.getProfile).toHaveBeenCalledWith('user-1');
    expect(result.id).toBe('p1');
  });

  it('updates profile for user', async () => {
    const service = {
      getProfile: jest.fn(),
      updateProfile: jest.fn().mockResolvedValue({ id: 'p1' } as UserProfileEntity),
    } as unknown as ProfileService;

    const controller = new ProfileController(service);
    const result = await controller.updateProfile({ user: { id: 'user-1' } }, { keywords: ['a'] });

    expect(service.updateProfile).toHaveBeenCalledWith('user-1', { keywords: ['a'] });
    expect(result.id).toBe('p1');
  });
});
