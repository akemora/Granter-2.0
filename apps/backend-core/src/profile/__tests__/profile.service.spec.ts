import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileService } from '../profile.service';
import { UserProfileEntity } from '../../database/entities/user-profile.entity';

describe('ProfileService', () => {
  let service: ProfileService;
  let repository: jest.Mocked<Repository<UserProfileEntity>>;

  beforeEach(async () => {
    repository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: getRepositoryToken(UserProfileEntity),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('returns default profile when none exists', async () => {
    repository.findOne.mockResolvedValue(null);
    repository.create.mockImplementation((input) => input as UserProfileEntity);
    repository.save.mockImplementation(async (input) => ({ ...input, id: 'profile-1' }) as UserProfileEntity);

    const result = await service.getProfile('user-1');

    expect(result.userId).toBe('user-1');
    expect(result.keywords).toEqual([]);
  });

  it('updates profile fields', async () => {
    repository.findOne.mockResolvedValue({
      id: 'profile-1',
      userId: 'user-1',
      keywords: [],
      regions: [],
      emailNotifications: false,
      telegramNotifications: false,
      email: null,
      telegramChatId: null,
      minAmount: null,
      maxAmount: null,
      updatedAt: new Date(),
      user: null as any,
    });
    repository.create.mockImplementation((input) => input as UserProfileEntity);
    repository.save.mockImplementation(async (input) => input as UserProfileEntity);

    const result = await service.updateProfile('user-1', {
      keywords: ['ia', 'digital'],
      regions: ['ES'],
      emailNotifications: true,
    });

    expect(result.keywords).toEqual(['ia', 'digital']);
    expect(result.regions).toEqual(['ES']);
    expect(result.emailNotifications).toBe(true);
  });
});
