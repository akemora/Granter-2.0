import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService } from '../notifications.service';
import { GrantNotificationEntity } from '../../database/entities/grant-notification.entity';
import { UserProfileEntity } from '../../database/entities/user-profile.entity';
import { RecommendationsService } from '../../recommendations/recommendations.service';
import { GrantEntity } from '../../database/entities/grant.entity';
import { GrantStatus } from '../../common/enums/grant-status.enum';

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: { createTransport: jest.fn() },
  createTransport: jest.fn(),
}));

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repository: jest.Mocked<Repository<GrantNotificationEntity>>;
  let profileRepository: jest.Mocked<Repository<UserProfileEntity>>;
  let sendMail: jest.Mock;

  beforeEach(async () => {
    const nodemailer = await import('nodemailer');
    sendMail = jest.fn();
    (nodemailer.default.createTransport as jest.Mock).mockReturnValue({ sendMail });
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });

    repository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as any;

    profileRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(GrantNotificationEntity),
          useValue: repository,
        },
        {
          provide: getRepositoryToken(UserProfileEntity),
          useValue: profileRepository,
        },
        {
          provide: RecommendationsService,
          useValue: {
            rankGrants: jest.fn((grants: GrantEntity[]) =>
              grants.map((grant) => ({ grant, score: 1, matchedKeywords: [] as string[] })),
            ),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('returns zero summary when no grants are provided', async () => {
    const result = await service.notifyForNewGrants([]);
    expect(result).toEqual({ processed: 0, sent: 0, failed: 0 });
  });

  it('returns zero summary when no profiles are eligible', async () => {
    profileRepository.find.mockResolvedValue([]);

    const grants: GrantEntity[] = [
      {
        id: '1',
        title: 'Grant 1',
        description: 'Desc',
        region: 'ES',
        amount: 1000,
        deadline: null,
        officialUrl: null,
        status: GrantStatus.OPEN,
        sectors: null,
        beneficiaries: null,
        sourceId: null,
        source: null as any,
        createdAt: new Date(),
      },
    ];

    const result = await service.notifyForNewGrants(grants);

    expect(result).toEqual({ processed: 0, sent: 0, failed: 0 });
  });

  it('processes grants but skips sending when recipient data is missing', async () => {
    profileRepository.find.mockResolvedValue([
      {
        id: 'profile-1',
        userId: 'user-1',
        keywords: [],
        regions: [],
        minAmount: null,
        maxAmount: null,
        emailNotifications: true,
        telegramNotifications: false,
        email: null,
        telegramChatId: null,
        updatedAt: new Date(),
        user: null as any,
      },
    ]);

    const grants: GrantEntity[] = [
      {
        id: '1',
        title: 'Grant 1',
        description: 'Desc',
        region: 'ES',
        amount: 1000,
        deadline: null,
        officialUrl: null,
        status: GrantStatus.OPEN,
        sectors: null,
        beneficiaries: null,
        sourceId: null,
        source: null as any,
        createdAt: new Date(),
      },
    ];

    const result = await service.notifyForNewGrants(grants);

    expect(result.processed).toBe(1);
    expect(result.sent).toBe(0);
    expect(result.failed).toBe(0);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('returns recent notifications', async () => {
    const notifications = [{ id: 'n1' } as GrantNotificationEntity, { id: 'n2' } as GrantNotificationEntity];
    repository.find.mockResolvedValue(notifications);

    const result = await service.getRecent(2);

    expect(result).toEqual(notifications);
    expect(repository.find).toHaveBeenCalledWith({
      relations: ['grant'],
      order: { createdAt: 'DESC' },
      take: 2,
    });
  });

  it('returns empty recent notifications when profile not found', async () => {
    profileRepository.findOne.mockResolvedValue(null);

    const result = await service.getRecentForUser('user-1', 5);

    expect(result).toEqual([]);
  });

  it('returns user-specific notifications by recipient', async () => {
    profileRepository.findOne.mockResolvedValue({
      id: 'profile-1',
      userId: 'user-1',
      emailNotifications: true,
      telegramNotifications: true,
      email: 'user@example.com',
      telegramChatId: '123',
    } as UserProfileEntity);
    repository.find.mockResolvedValue([{ id: 'n1' } as GrantNotificationEntity]);

    const result = await service.getRecentForUser('user-1', 10);

    expect(result).toHaveLength(1);
    expect(repository.find).toHaveBeenCalledWith({
      where: { recipient: expect.anything() },
      relations: ['grant'],
      order: { createdAt: 'DESC' },
      take: 10,
    });
  });

  it('sends email notifications when enabled', async () => {
    process.env.EMAIL_HOST = 'smtp.test';
    process.env.EMAIL_USER = 'user';
    process.env.EMAIL_PASSWORD = 'pass';
    process.env.EMAIL_FROM = 'no-reply@test.com';

    profileRepository.find.mockResolvedValue([
      {
        id: 'profile-1',
        userId: 'user-1',
        keywords: [],
        regions: [],
        minAmount: null,
        maxAmount: null,
        emailNotifications: true,
        telegramNotifications: false,
        email: 'user@example.com',
        telegramChatId: null,
        updatedAt: new Date(),
        user: null as any,
      } as UserProfileEntity,
    ]);

    repository.findOne.mockResolvedValue(null);
    repository.save.mockResolvedValue({} as GrantNotificationEntity);
    sendMail.mockResolvedValue({} as any);

    const grants: GrantEntity[] = [
      {
        id: '1',
        title: 'Grant 1',
        description: 'Desc',
        region: 'ES',
        amount: 1000,
        deadline: null,
        officialUrl: null,
        status: GrantStatus.OPEN,
        sectors: null,
        beneficiaries: null,
        sourceId: null,
        source: null as any,
        createdAt: new Date(),
      },
    ];

    const result = await service.notifyForNewGrants(grants);

    expect(result.sent).toBe(1);
    expect(sendMail).toHaveBeenCalled();
    delete process.env.EMAIL_HOST;
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASSWORD;
    delete process.env.EMAIL_FROM;
  });
});
