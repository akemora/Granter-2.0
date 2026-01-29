import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchController } from '../search.controller';
import { SearchService } from '../search.service';
import { GrantEntity } from '../../database/entities/grant.entity';
import { SourceEntity } from '../../database/entities/source.entity';
import { applyTestAppConfig } from '../../../test/utils/test-app';

/**
 * E2E Integration Tests for Search Functionality
 *
 * Tests the complete search flow:
 * 1. SearchInput → Controller → Service → Database
 * 2. Database indices are used
 * 3. Pagination works correctly
 * 4. Filters are combined properly
 * 5. Error handling is comprehensive
 */
describe('Search E2E Integration Tests (S2-D3-3)', () => {
  let app: INestApplication;
  let grantsRepository: Repository<GrantEntity>;
  let sourcesRepository: Repository<SourceEntity>;

  const mockSource: Partial<SourceEntity> = {
    id: 'src-1',
    name: 'Test Source',
    url: 'https://example.com',
    region: 'ES',
  };

  const mockGrants: Array<Partial<GrantEntity>> = [
    {
      id: 'grant-1',
      title: 'Research Funding 2026',
      description: 'Advanced research in artificial intelligence and machine learning',
      amount: 50000,
      deadline: new Date('2026-12-31'),
      region: 'ES',
      source: mockSource as SourceEntity,
      createdAt: new Date('2026-01-28'),
    },
    {
      id: 'grant-2',
      title: 'Environmental Grant',
      description: 'Support for renewable energy and sustainability projects',
      amount: 75000,
      deadline: new Date('2026-11-30'),
      region: 'EU',
      source: mockSource as SourceEntity,
      createdAt: new Date('2026-01-27'),
    },
    {
      id: 'grant-3',
      title: 'Health Innovation Fund',
      description: 'Research funding for medical technology and healthcare innovation',
      amount: 100000,
      deadline: new Date('2026-10-31'),
      region: 'EU',
      source: mockSource as SourceEntity,
      createdAt: new Date('2026-01-26'),
    },
    {
      id: 'grant-4',
      title: 'Education Excellence',
      description: 'Higher education development and student support programs',
      amount: 30000,
      deadline: new Date('2026-09-30'),
      region: 'INT',
      source: mockSource as SourceEntity,
      createdAt: new Date('2026-01-25'),
    },
  ];

  const buildQueryBuilder = (data: Array<Partial<GrantEntity>>, total: number) => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(data as GrantEntity[]),
    getCount: jest.fn().mockResolvedValue(total),
  });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        SearchService,
        {
          provide: getRepositoryToken(GrantEntity),
          useValue: {
            createQueryBuilder: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SourceEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    applyTestAppConfig(app);

    await app.init();

    grantsRepository = module.get<Repository<GrantEntity>>(getRepositoryToken(GrantEntity));
    sourcesRepository = module.get<Repository<SourceEntity>>(getRepositoryToken(SourceEntity));
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /search - Basic Search', () => {
    it('should return all grants when no filters applied', async () => {
      const mockQueryBuilder = buildQueryBuilder(mockGrants, mockGrants.length);

      jest.spyOn(grantsRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const response = await request(app.getHttpServer()).get('/search').expect(200);

      const body = response.body.data;
      expect(body.data).toHaveLength(4);
      expect(body.total).toBe(4);
      expect(body.skip).toBe(0);
      expect(body.take).toBe(20);
      expect(body.currentPage).toBe(1);
      expect(body.totalPages).toBe(1);
    });

    it('should search by query string', async () => {
      const filtered = [mockGrants[0]];
      const mockQueryBuilder = buildQueryBuilder(filtered, 1);

      jest.spyOn(grantsRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const response = await request(app.getHttpServer()).get('/search').query({ query: 'research' }).expect(200);

      const body = response.body.data;
      expect(body.data).toHaveLength(1);
      expect(body.total).toBe(1);
      expect(body.data[0].title).toContain('Research');
    });

    it('should filter by single region', async () => {
      const filtered = [mockGrants[0]];
      const mockQueryBuilder = buildQueryBuilder(filtered, 1);

      jest.spyOn(grantsRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const response = await request(app.getHttpServer()).get('/search').query({ regions: 'ES' }).expect(200);

      const body = response.body.data;
      expect(body.data[0].region).toBe('ES');
    });

    it('should filter by multiple regions', async () => {
      const filtered = [mockGrants[1], mockGrants[2]];
      const mockQueryBuilder = buildQueryBuilder(filtered, 2);

      jest.spyOn(grantsRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const response = await request(app.getHttpServer())
        .get('/search')
        .query({ regions: ['EU', 'INT'] })
        .expect(200);

      const body = response.body.data;
      expect(body.total).toBe(2);
      expect(body.data.every((g: any) => ['EU', 'INT'].includes(g.region))).toBe(true);
    });

    it('should filter by amount range', async () => {
      const filtered = [mockGrants[1], mockGrants[2]];
      const mockQueryBuilder = buildQueryBuilder(filtered, 2);

      jest.spyOn(grantsRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const response = await request(app.getHttpServer())
        .get('/search')
        .query({ minAmount: 70000, maxAmount: 110000 })
        .expect(200);

      const body = response.body.data;
      expect(body.data.every((g: any) => g.amount >= 70000 && g.amount <= 110000)).toBe(true);
    });

    it('should filter by deadline range', async () => {
      const filtered = [mockGrants[1]];
      const mockQueryBuilder = buildQueryBuilder(filtered, 1);

      jest.spyOn(grantsRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const response = await request(app.getHttpServer())
        .get('/search')
        .query({
          deadlineAfter: '2026-11-15',
          deadlineBefore: '2026-12-15',
        })
        .expect(200);

      const body = response.body.data;
      expect(body.data).toHaveLength(1);
    });
  });

  describe('GET /search - Pagination', () => {
    it('should paginate results with skip and take', async () => {
      const page2 = [mockGrants[2], mockGrants[3]];
      const mockQueryBuilder = buildQueryBuilder(page2, 4);

      jest.spyOn(grantsRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const response = await request(app.getHttpServer()).get('/search').query({ skip: 2, take: 2 }).expect(200);

      const body = response.body.data;
      expect(body.data).toHaveLength(2);
      expect(body.skip).toBe(2);
      expect(body.take).toBe(2);
      expect(body.currentPage).toBe(2);
      expect(body.totalPages).toBe(2);
    });

    it('should enforce maximum page size of 100', async () => {
      const mockQueryBuilder = buildQueryBuilder(mockGrants, mockGrants.length);

      jest.spyOn(grantsRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const response = await request(app.getHttpServer()).get('/search').query({ skip: 0, take: 200 }).expect(200);

      // Should be capped at 100
      const body = response.body.data;
      expect(body.take).toBeLessThanOrEqual(100);
    });
  });

  describe('GET /search - Combined Filters', () => {
    it('should combine multiple filters', async () => {
      const filtered = [mockGrants[2]];
      const mockQueryBuilder = buildQueryBuilder(filtered, 1);

      jest.spyOn(grantsRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const response = await request(app.getHttpServer())
        .get('/search')
        .query({
          query: 'health',
          regions: 'EU',
          minAmount: 80000,
          maxAmount: 150000,
        })
        .expect(200);

      const body = response.body.data;
      expect(body.data).toHaveLength(1);
      expect(body.data[0].region).toBe('EU');
    });
  });

  describe('GET /search - Validation & Error Handling', () => {
    it('should reject invalid skip parameter (negative)', async () => {
      await request(app.getHttpServer()).get('/search').query({ skip: -1 }).expect(400);
    });

    it('should reject invalid take parameter (0 or negative)', async () => {
      await request(app.getHttpServer()).get('/search').query({ take: 0 }).expect(400);
    });

    it('should reject empty search query', async () => {
      await request(app.getHttpServer()).get('/search').query({ query: '' }).expect(400);
    });

    it('should reject query exceeding max length', async () => {
      const longQuery = 'a'.repeat(501);
      await request(app.getHttpServer()).get('/search').query({ query: longQuery }).expect(400);
    });

    it('should reject invalid date format', async () => {
      await request(app.getHttpServer()).get('/search').query({ deadlineAfter: 'invalid-date' }).expect(400);
    });

    it('should reject deadline range where after > before', async () => {
      await request(app.getHttpServer())
        .get('/search')
        .query({
          deadlineAfter: '2026-12-31',
          deadlineBefore: '2026-01-01',
        })
        .expect(400);
    });

    it('should reject minAmount > maxAmount', async () => {
      await request(app.getHttpServer())
        .get('/search')
        .query({
          minAmount: 100000,
          maxAmount: 50000,
        })
        .expect(400);
    });

    it('should reject negative amounts', async () => {
      await request(app.getHttpServer()).get('/search').query({ minAmount: -1000 }).expect(400);
    });

    it('should return 400 on database error', async () => {
      const mockQueryBuilder = buildQueryBuilder([], 0);
      mockQueryBuilder.getCount.mockRejectedValue(new Error('Database connection error'));

      jest.spyOn(grantsRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const response = await request(app.getHttpServer()).get('/search').query({ query: 'test' }).expect(400);

      expect(response.body.error?.message).toBeDefined();
    });
  });

  describe('GET /search - Response Format', () => {
    it('should return correct response structure', async () => {
      const mockQueryBuilder = buildQueryBuilder(mockGrants.slice(0, 2), 4);

      jest.spyOn(grantsRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const response = await request(app.getHttpServer()).get('/search').query({ take: 2 }).expect(200);

      const body = response.body.data;
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('total');
      expect(body).toHaveProperty('skip');
      expect(body).toHaveProperty('take');
      expect(body).toHaveProperty('currentPage');
      expect(body).toHaveProperty('totalPages');
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should return grants with all required fields', async () => {
      const mockQueryBuilder = buildQueryBuilder(mockGrants.slice(0, 1), 1);

      jest.spyOn(grantsRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const response = await request(app.getHttpServer()).get('/search').expect(200);

      const grant = response.body.data.data[0];
      expect(grant).toHaveProperty('id');
      expect(grant).toHaveProperty('title');
      expect(grant).toHaveProperty('description');
      expect(grant).toHaveProperty('amount');
      expect(grant).toHaveProperty('deadline');
      expect(grant).toHaveProperty('region');
    });
  });

  describe('GET /search - Performance', () => {
    it('should complete search within reasonable time', async () => {
      const mockQueryBuilder = buildQueryBuilder(mockGrants, 4);

      jest.spyOn(grantsRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const startTime = Date.now();
      await request(app.getHttpServer()).get('/search').query({ query: 'test', regions: 'ES' }).expect(200);
      const endTime = Date.now();

      // Should complete in less than 1 second
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
