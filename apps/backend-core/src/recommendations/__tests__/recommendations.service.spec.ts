import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationsService } from '../recommendations.service';
import { SearchService } from '../../search/search.service';
import { ProfileService } from '../../profile/profile.service';
import { GrantEntity } from '../../database/entities/grant.entity';
import { UserProfileEntity } from '../../database/entities/user-profile.entity';
import { GrantStatus } from '../../common/enums/grant-status.enum';

describe('RecommendationsService', () => {
  let service: RecommendationsService;
  let searchService: { searchGrants: jest.Mock };
  let profileService: { getProfile: jest.Mock };

  beforeEach(async () => {
    searchService = { searchGrants: jest.fn() };
    profileService = { getProfile: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        {
          provide: SearchService,
          useValue: searchService,
        },
        {
          provide: ProfileService,
          useValue: profileService,
        },
      ],
    }).compile();

    service = module.get<RecommendationsService>(RecommendationsService);
  });

  it('ranks and filters grants based on profile', () => {
    const profile: UserProfileEntity = {
      id: 'profile-1',
      userId: 'user-1',
      keywords: ['IA', 'digital'],
      regions: ['ES'],
      minAmount: 1000,
      maxAmount: 5000,
      emailNotifications: false,
      telegramNotifications: false,
      email: null,
      telegramChatId: null,
      updatedAt: new Date(),
      user: null as any,
    };

    const grants: GrantEntity[] = [
      {
        id: '1',
        title: 'IA para pymes',
        description: 'Programa de digitalizacion',
        region: 'ES',
        amount: 3000,
        deadline: null,
        officialUrl: null,
        status: GrantStatus.OPEN,
        sectors: null,
        beneficiaries: null,
        sourceId: null,
        source: null as any,
        createdAt: new Date(),
      },
      {
        id: '2',
        title: 'Agricultura',
        description: 'Subvencion rural',
        region: 'FR',
        amount: 3000,
        deadline: null,
        officialUrl: null,
        status: GrantStatus.OPEN,
        sectors: null,
        beneficiaries: null,
        sourceId: null,
        source: null as any,
        createdAt: new Date(),
      },
      {
        id: '3',
        title: 'IA avanzada',
        description: 'Proyectos de digitalizacion',
        region: 'ES',
        amount: 9000,
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

    const ranked = service.rankGrants(grants, profile);

    expect(ranked).toHaveLength(1);
    expect(ranked[0].grant.id).toBe('1');
    expect(ranked[0].matchedKeywords.length).toBeGreaterThan(0);
  });

  it('uses user-specific profile when fetching recommendations', async () => {
    const profile: UserProfileEntity = {
      id: 'profile-1',
      userId: 'user-1',
      keywords: ['ia'],
      regions: ['ES'],
      minAmount: null,
      maxAmount: null,
      emailNotifications: false,
      telegramNotifications: false,
      email: null,
      telegramChatId: null,
      updatedAt: new Date(),
      user: null as any,
    };

    profileService.getProfile.mockResolvedValue(profile);
    searchService.searchGrants.mockResolvedValue({
      data: [],
      total: 0,
      skip: 0,
      take: 10,
      currentPage: 1,
      totalPages: 0,
    });

    await service.getRecommendations('user-1', 5);

    expect(profileService.getProfile).toHaveBeenCalledWith('user-1');
  });
});
