import { Repository } from 'typeorm';
import { RefreshTokenCleanupService } from '../refresh-token-cleanup.service';
import { RefreshTokenEntity } from '../../database/entities/refresh-token.entity';

describe('RefreshTokenCleanupService', () => {
  let repo: jest.Mocked<Repository<RefreshTokenEntity>>;
  let service: RefreshTokenCleanupService;

  beforeEach(() => {
    repo = {
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<RefreshTokenEntity>>;
    service = new RefreshTokenCleanupService(repo);
    jest.clearAllMocks();
  });

  it('deletes stale tokens', async () => {
    repo.delete.mockResolvedValue({ affected: 2 } as any);

    await (service as any).cleanupTokens();

    expect(repo.delete).toHaveBeenCalled();
  });

  it('skips cleanup when already running', async () => {
    (service as any).running = true;

    await (service as any).cleanupTokens();

    expect(repo.delete).not.toHaveBeenCalled();
  });
});
