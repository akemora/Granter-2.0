import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, Logger } from '@nestjs/common';
import { SearchService } from '../search.service';
import { GrantEntity } from '../../database/entities/grant.entity';
import { SearchFiltersDto } from '../dto/search-filters.dto';
import { SourceType } from '../../common/enums/source-type.enum';
import { GrantStatus } from '../../common/enums/grant-status.enum';

describe('SearchService', () => {
  let service: SearchService;
  let mockRepository: jest.Mocked<Repository<GrantEntity>>;

  // Mock grant data
  const mockGrant1: GrantEntity = {
    id: '1',
    title: 'Research Funding Program',
    description: 'Support for research initiatives and innovation',
    amount: 50000,
    deadline: new Date('2024-12-31'),
    region: 'ES',
    status: GrantStatus.OPEN,
    sectors: ['research', 'innovation'],
    beneficiaries: ['universities'],
    sourceId: 'source-1',
    source: {
      id: 'source-1',
      name: 'Spanish Science Foundation',
      url: 'https://example.com',
      region: 'ES',
      active: true,
      type: SourceType.HTML,
      metadata: null,
      lastRun: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    createdAt: new Date('2024-01-01'),
  };

  const mockGrant2: GrantEntity = {
    id: '2',
    title: 'European Technology Grant',
    description: 'Innovation funding for tech startups across Europe',
    amount: 100000,
    deadline: new Date('2024-06-30'),
    region: 'EU',
    status: GrantStatus.CLOSED,
    sectors: ['technology'],
    beneficiaries: ['startups'],
    sourceId: 'source-2',
    source: {
      id: 'source-2',
      name: 'EU Research Council',
      url: 'https://example.com',
      region: 'EU',
      active: true,
      type: SourceType.HTML,
      metadata: null,
      lastRun: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    createdAt: new Date('2024-01-15'),
  };

  const mockGrant3: GrantEntity = {
    id: '3',
    title: 'International Fellowship',
    description: 'Global scholarships for graduate studies',
    amount: 25000,
    deadline: new Date('2024-11-30'),
    region: 'INT',
    status: GrantStatus.UPCOMING,
    sectors: ['education'],
    beneficiaries: ['students'],
    sourceId: 'source-3',
    source: {
      id: 'source-3',
      name: 'Global Education Trust',
      url: 'https://example.com',
      region: 'INT',
      active: true,
      type: SourceType.HTML,
      metadata: null,
      lastRun: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    createdAt: new Date('2024-02-01'),
  };

  beforeEach(async () => {
    // Create mock repository with jest.Mocked
    mockRepository = {
      createQueryBuilder: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: getRepositoryToken(GrantEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);

    // Suppress logger output in tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('searchGrants', () => {
    it('should return all grants without filters', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(3),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockGrant1, mockGrant2, mockGrant3]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQuery as any);

      const result = await service.searchGrants({});

      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.currentPage).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should apply full-text search filter', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockGrant1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQuery as any);

      const filters: SearchFiltersDto = { query: 'research' };
      const result = await service.searchGrants(filters);

      expect(mockQuery.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('to_tsvector'),
        expect.objectContaining({ query: 'research' }),
      );
      expect(result.data).toHaveLength(1);
    });

    it('should apply region filter with multiple regions', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockGrant1, mockGrant2]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQuery as any);

      const filters: SearchFiltersDto = { regions: ['ES', 'EU'] };
      const result = await service.searchGrants(filters);

      expect(mockQuery.andWhere).toHaveBeenCalledWith(
        'grant.region IN (:...regions)',
        expect.objectContaining({ regions: ['ES', 'EU'] }),
      );
      expect(result.data).toHaveLength(2);
    });

    it('should apply sector filter with multiple sectors', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockGrant1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQuery as any);

      const filters: SearchFiltersDto = { sectors: ['research', 'innovation'] };
      await service.searchGrants(filters);

      expect(mockQuery.andWhere).toHaveBeenCalledWith(
        "string_to_array(grant.sectors, ',') && ARRAY[:...sectors]::text[]",
        expect.objectContaining({ sectors: ['research', 'innovation'] }),
      );
    });

    it('should apply beneficiary filter with multiple values', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockGrant1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQuery as any);

      const filters: SearchFiltersDto = { beneficiaries: ['universities', 'startups'] };
      await service.searchGrants(filters);

      expect(mockQuery.andWhere).toHaveBeenCalledWith(
        "string_to_array(grant.beneficiaries, ',') && ARRAY[:...beneficiaries]::text[]",
        expect.objectContaining({ beneficiaries: ['universities', 'startups'] }),
      );
    });

    it('should apply status filter', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockGrant1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQuery as any);

      const filters: SearchFiltersDto = { status: GrantStatus.OPEN };
      await service.searchGrants(filters);

      expect(mockQuery.andWhere).toHaveBeenCalledWith(
        'grant.status = :status',
        expect.objectContaining({ status: GrantStatus.OPEN }),
      );
    });

    it('should apply amount range filters', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockGrant1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQuery as any);

      const filters: SearchFiltersDto = { minAmount: 40000, maxAmount: 60000 };
      await service.searchGrants(filters);

      expect(mockQuery.andWhere).toHaveBeenCalledWith('grant.amount >= :minAmount', { minAmount: 40000 });
      expect(mockQuery.andWhere).toHaveBeenCalledWith('grant.amount <= :maxAmount', { maxAmount: 60000 });
    });

    it('should handle pagination with defaults', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(3),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockGrant1, mockGrant2]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQuery as any);

      const result = await service.searchGrants({}, {});

      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.take).toHaveBeenCalledWith(20);
      expect(result.skip).toBe(0);
      expect(result.take).toBe(20);
    });

    it('should enforce maximum page size', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(150),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQuery as any);

      const result = await service.searchGrants({}, { skip: 0, take: 200 });

      expect(mockQuery.take).toHaveBeenCalledWith(100); // MAX_PAGE_SIZE
      expect(result.take).toBe(100);
    });

    it('should calculate pagination correctly', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(150),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockGrant1, mockGrant2]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQuery as any);

      const result = await service.searchGrants({}, { skip: 40, take: 20 });

      expect(result.currentPage).toBe(3); // (40 / 20) + 1
      expect(result.totalPages).toBe(8); // ceil(150 / 20)
    });

    it('should sort by createdAt DESC', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(3),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockGrant2, mockGrant1, mockGrant3]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQuery as any);

      await service.searchGrants({});

      expect(mockQuery.orderBy).toHaveBeenCalledWith('grant.createdAt', 'DESC');
      expect(mockQuery.addOrderBy).toHaveBeenCalledWith('grant.id', 'ASC');
    });

    it('should apply deadline range filters', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockGrant1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQuery as any);

      const filters: SearchFiltersDto = {
        deadlineAfter: '2024-06-01',
        deadlineBefore: '2024-12-31',
      };

      await service.searchGrants(filters);

      expect(mockQuery.andWhere).toHaveBeenCalledWith('grant.deadline > :deadlineAfter', expect.any(Object));
      expect(mockQuery.andWhere).toHaveBeenCalledWith('grant.deadline < :deadlineBefore', expect.any(Object));
    });

    it('should combine multiple filters', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockGrant1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQuery as any);

      const filters: SearchFiltersDto = {
        query: 'research',
        regions: ['ES'],
        minAmount: 40000,
        maxAmount: 60000,
      };

      await service.searchGrants(filters);

      // Should have multiple andWhere calls
      expect(mockQuery.andWhere).toHaveBeenCalledTimes(4);
    });

    it('should throw on negative skip parameter', async () => {
      await expect(service.searchGrants({}, { skip: -1, take: 20 })).rejects.toThrow(BadRequestException);
    });

    it('should throw on zero or negative take parameter', async () => {
      await expect(service.searchGrants({}, { skip: 0, take: 0 })).rejects.toThrow(BadRequestException);
    });

    it('should throw on empty search query', async () => {
      await expect(service.searchGrants({ query: '' })).rejects.toThrow(BadRequestException);
    });

    it('should throw on whitespace-only search query', async () => {
      await expect(service.searchGrants({ query: '   ' })).rejects.toThrow(BadRequestException);
    });

    it('should throw on excessively long search query', async () => {
      const longQuery = 'a'.repeat(501);
      await expect(service.searchGrants({ query: longQuery })).rejects.toThrow(BadRequestException);
    });

    it('should throw on negative minAmount', async () => {
      await expect(service.searchGrants({ minAmount: -100 })).rejects.toThrow(BadRequestException);
    });

    it('should throw on negative maxAmount', async () => {
      await expect(service.searchGrants({ maxAmount: -100 })).rejects.toThrow(BadRequestException);
    });

    it('should throw when minAmount > maxAmount', async () => {
      await expect(service.searchGrants({ minAmount: 100000, maxAmount: 10000 })).rejects.toThrow(BadRequestException);
    });

    it('should throw on invalid deadlineAfter format', async () => {
      await expect(service.searchGrants({ deadlineAfter: 'not-a-date' })).rejects.toThrow(BadRequestException);
    });

    it('should throw on invalid deadlineBefore format', async () => {
      await expect(service.searchGrants({ deadlineBefore: 'invalid-date' })).rejects.toThrow(BadRequestException);
    });

    it('should throw when deadlineAfter >= deadlineBefore', async () => {
      await expect(
        service.searchGrants({
          deadlineAfter: '2024-12-31',
          deadlineBefore: '2024-12-31',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle database errors gracefully', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockRejectedValue(new Error('Database connection error')),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQuery as any);

      await expect(service.searchGrants({})).rejects.toThrow(BadRequestException);
    });

    it('should handle null filter values', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(3),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockGrant1, mockGrant2, mockGrant3]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQuery as any);

      const result = await service.searchGrants({
        minAmount: null,
        maxAmount: null,
      } as any);

      expect(result.total).toBe(3);
    });
  });

  describe('SearchResultDto', () => {
    it('should calculate currentPage correctly', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(100),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockGrant1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQuery as any);

      const result = await service.searchGrants({}, { skip: 20, take: 10 });

      expect(result.currentPage).toBe(3); // (20 / 10) + 1
    });

    it('should calculate totalPages correctly', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(47),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQuery as any);

      const result = await service.searchGrants({}, { skip: 0, take: 10 });

      expect(result.totalPages).toBe(5); // ceil(47 / 10)
    });
  });
});
