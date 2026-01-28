import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SearchService } from '../search.service';
import { GrantEntity } from '../../database/entities/grant.entity';
import { SourceEntity } from '../../database/entities/source.entity';
import { SearchFiltersDto } from '../dto/search-filters.dto';

/**
 * Integration Tests for SearchService
 *
 * These tests use a real PostgreSQL test database to validate SearchService
 * functionality with actual database queries. Tests include:
 * - Full-text search capabilities
 * - Single filter functionality
 * - Combined filter combinations
 * - Pagination enforcement
 * - Edge cases and error handling
 *
 * To run these tests, ensure PostgreSQL is running and accessible.
 * Test database configuration is set up in the beforeAll hook.
 */
describe('SearchService Integration Tests', () => {
  let app: INestApplication;
  let searchService: SearchService;
  let dataSource: DataSource;
  let grantsRepository: Repository<GrantEntity>;
  let sourcesRepository: Repository<SourceEntity>;

  // Test data constants
  const TEST_SOURCES = {
    spanish_science: {
      name: 'Spanish Science Foundation',
      url: 'https://example.com/spanish-science',
      region: 'ES',
      active: true,
    },
    eu_research: {
      name: 'EU Research Council',
      url: 'https://example.com/eu-research',
      region: 'EU',
      active: true,
    },
    international_fund: {
      name: 'International Development Fund',
      url: 'https://example.com/intl-fund',
      region: 'INT',
      active: true,
    },
  };

  // ==================== Setup & Teardown ====================

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.TEST_DB_HOST || 'localhost',
          port: parseInt(process.env.TEST_DB_PORT || '5432'),
          username: process.env.TEST_DB_USERNAME || 'test',
          password: process.env.TEST_DB_PASSWORD || 'test',
          database: process.env.TEST_DB_NAME || 'granter_search_test',
          entities: [GrantEntity, SourceEntity],
          synchronize: true,
          dropSchema: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([GrantEntity, SourceEntity]),
      ],
      providers: [SearchService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    searchService = moduleFixture.get<SearchService>(SearchService);
    dataSource = moduleFixture.get<DataSource>(DataSource);
    grantsRepository = dataSource.getRepository(GrantEntity);
    sourcesRepository = dataSource.getRepository(SourceEntity);

    await seedTestData();
  });

  afterAll(async () => {
    await app.close();
  });

  // ==================== Seed Data ====================

  async function seedTestData(): Promise<void> {
    // Create test sources
    const sourceSpain = await sourcesRepository.save(TEST_SOURCES.spanish_science);
    const sourceEU = await sourcesRepository.save(TEST_SOURCES.eu_research);
    const sourceIntl = await sourcesRepository.save(TEST_SOURCES.international_fund);

    // Create diverse test grants
    const testGrants: Partial<GrantEntity>[] = [
      // Spain region grants (5 grants)
      {
        title: 'AI Research Initiative',
        description: 'Funding for artificial intelligence research and development projects',
        amount: 50000,
        region: 'ES',
        deadline: new Date('2026-12-31'),
        source: sourceSpain,
      },
      {
        title: 'Green Energy Spain',
        description: 'Support for renewable energy projects in Spain',
        amount: 75000,
        region: 'ES',
        deadline: new Date('2026-08-15'),
        source: sourceSpain,
      },
      {
        title: 'Education Technology Grant',
        description: 'Funding for educational technology advancement and innovation',
        amount: 25000,
        region: 'ES',
        deadline: new Date('2026-09-30'),
        source: sourceSpain,
      },
      {
        title: 'Healthcare Innovation Program',
        description: 'Support for healthcare technology and innovation initiatives',
        amount: 100000,
        region: 'ES',
        deadline: new Date('2026-11-15'),
        source: sourceSpain,
      },
      {
        title: 'Environmental Protection Initiative',
        description: 'Grants for environmental conservation and climate change mitigation',
        amount: 40000,
        region: 'ES',
        deadline: new Date('2026-07-01'),
        source: sourceSpain,
      },

      // EU region grants (5 grants)
      {
        title: 'European Technology Fund',
        description: 'Innovation funding for tech startups across Europe',
        amount: 120000,
        region: 'EU',
        deadline: new Date('2026-06-30'),
        source: sourceEU,
      },
      {
        title: 'Climate Change Research Europe',
        description: 'Research funding for climate change solutions in Europe',
        amount: 95000,
        region: 'EU',
        deadline: new Date('2026-10-15'),
        source: sourceEU,
      },
      {
        title: 'Renewable Energy Development',
        description: 'Support for renewable energy development and deployment',
        amount: 150000,
        region: 'EU',
        deadline: new Date('2026-05-20'),
        source: sourceEU,
      },
      {
        title: 'Health Research Alliance',
        description: 'Collaborative health and medical research funding',
        amount: 85000,
        region: 'EU',
        deadline: new Date('2026-09-15'),
        source: sourceEU,
      },
      {
        title: 'Digital Education Initiative',
        description: 'Funding for digital education and e-learning programs',
        amount: 60000,
        region: 'EU',
        deadline: new Date('2026-08-31'),
        source: sourceEU,
      },

      // International region grants (5 grants)
      {
        title: 'Global Development Program',
        description: 'International funding for sustainable development projects',
        amount: 200000,
        region: 'INT',
        deadline: new Date('2026-12-15'),
        source: sourceIntl,
      },
      {
        title: 'International Fellowship Grant',
        description: 'Global scholarships for graduate studies and research',
        amount: 30000,
        region: 'INT',
        deadline: new Date('2026-07-31'),
        source: sourceIntl,
      },
      {
        title: 'World Health Initiative',
        description: 'Global health funding for disease prevention and research',
        amount: 180000,
        region: 'INT',
        deadline: new Date('2026-11-30'),
        source: sourceIntl,
      },
      {
        title: 'Education Without Borders',
        description: 'International education program for developing countries',
        amount: 50000,
        region: 'INT',
        deadline: new Date('2026-06-15'),
        source: sourceIntl,
      },
      {
        title: 'Clean Water Project',
        description: 'International initiative for clean water access and sanitation',
        amount: 75000,
        region: 'INT',
        deadline: new Date('2026-09-01'),
        source: sourceIntl,
      },

      // Additional grants for boundary testing
      {
        title: 'Micro Research Grant',
        description: 'Small research funding for pilot projects',
        amount: 5000,
        region: 'ES',
        deadline: new Date('2026-03-15'),
        source: sourceSpain,
      },
      {
        title: 'Macro Development Fund',
        description: 'Large-scale development project funding',
        amount: 250000,
        region: 'EU',
        deadline: new Date('2026-02-28'),
        source: sourceEU,
      },
    ];

    await grantsRepository.save(testGrants);
  }

  // ==================== Full-Text Search Tests ====================

  describe('Full-Text Search', () => {
    it('should find grants by single keyword in title', async () => {
      const result = await searchService.searchGrants(
        { query: 'research' },
        { skip: 0, take: 20 },
      );

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
      // Verify that all results contain 'research' in title or description
      const hasKeyword = result.data.every(
        (g) =>
          g.title.toLowerCase().includes('research') ||
          g.description.toLowerCase().includes('research'),
      );
      expect(hasKeyword).toBe(true);
    });

    it('should find grants by keyword in description', async () => {
      const result = await searchService.searchGrants(
        { query: 'innovation' },
        { skip: 0, take: 20 },
      );

      expect(result.data.length).toBeGreaterThan(0);
      // Verify results contain the keyword
      const hasKeyword = result.data.every(
        (g) =>
          g.title.toLowerCase().includes('innovation') ||
          g.description.toLowerCase().includes('innovation'),
      );
      expect(hasKeyword).toBe(true);
    });

    it('should search by multiple words (AND behavior)', async () => {
      const result = await searchService.searchGrants(
        { query: 'research funding' },
        { skip: 0, take: 20 },
      );

      expect(result.data.length).toBeGreaterThan(0);
      // Results should match the full-text search query
      expect(result.total).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', async () => {
      const result = await searchService.searchGrants(
        { query: 'nonexistent_keyword_xyz_abc' },
        { skip: 0, take: 20 },
      );

      expect(result.data.length).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  // ==================== Single Filter Tests ====================

  describe('Single Filter Tests', () => {
    it('should filter by single region (ES)', async () => {
      const result = await searchService.searchGrants(
        { regions: ['ES'] },
        { skip: 0, take: 20 },
      );

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data.every((g) => g.region === 'ES')).toBe(true);
    });

    it('should filter by multiple regions (ES and EU)', async () => {
      const result = await searchService.searchGrants(
        { regions: ['ES', 'EU'] },
        { skip: 0, take: 20 },
      );

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data.every((g) => ['ES', 'EU'].includes(g.region))).toBe(
        true,
      );
      // Verify we get grants from both regions
      const hasES = result.data.some((g) => g.region === 'ES');
      const hasEU = result.data.some((g) => g.region === 'EU');
      expect(hasES).toBe(true);
      expect(hasEU).toBe(true);
    });

    it('should filter by amount range (min: 10k, max: 50k)', async () => {
      const result = await searchService.searchGrants(
        { minAmount: 10000, maxAmount: 50000 },
        { skip: 0, take: 20 },
      );

      expect(result.data.length).toBeGreaterThan(0);
      expect(
        result.data.every(
          (g) =>
            parseFloat(g.amount.toString()) >= 10000 &&
            parseFloat(g.amount.toString()) <= 50000,
        ),
      ).toBe(true);
    });

    it('should filter by minimum amount only', async () => {
      const result = await searchService.searchGrants(
        { minAmount: 100000 },
        { skip: 0, take: 20 },
      );

      expect(result.data.length).toBeGreaterThan(0);
      expect(
        result.data.every((g) => parseFloat(g.amount.toString()) >= 100000),
      ).toBe(true);
    });

    it('should filter by maximum amount only', async () => {
      const result = await searchService.searchGrants(
        { maxAmount: 30000 },
        { skip: 0, take: 20 },
      );

      expect(result.data.length).toBeGreaterThan(0);
      expect(
        result.data.every((g) => parseFloat(g.amount.toString()) <= 30000),
      ).toBe(true);
    });
  });

  // ==================== Combined Filter Tests ====================

  describe('Combined Filter Tests', () => {
    it('should combine region and amount range filters', async () => {
      const result = await searchService.searchGrants(
        { regions: ['ES'], minAmount: 40000, maxAmount: 100000 },
        { skip: 0, take: 20 },
      );

      expect(result.data.length).toBeGreaterThan(0);
      expect(
        result.data.every((g) => {
          const amount = parseFloat(g.amount.toString());
          return (
            g.region === 'ES' &&
            amount >= 40000 &&
            amount <= 100000
          );
        }),
      ).toBe(true);
    });

    it('should combine multiple regions and amount filter', async () => {
      const result = await searchService.searchGrants(
        { regions: ['EU', 'INT'], minAmount: 80000 },
        { skip: 0, take: 20 },
      );

      expect(result.data.length).toBeGreaterThan(0);
      expect(
        result.data.every((g) => {
          const amount = parseFloat(g.amount.toString());
          return (
            ['EU', 'INT'].includes(g.region) &&
            amount >= 80000
          );
        }),
      ).toBe(true);
    });

    it('should combine search query with region filter', async () => {
      const result = await searchService.searchGrants(
        { query: 'research', regions: ['EU'] },
        { skip: 0, take: 20 },
      );

      expect(result.data.length).toBeGreaterThan(0);
      expect(
        result.data.every((g) => {
          const hasKeyword =
            g.title.toLowerCase().includes('research') ||
            g.description.toLowerCase().includes('research');
          return g.region === 'EU' && hasKeyword;
        }),
      ).toBe(true);
    });

    it('should combine search query, region, and amount filters', async () => {
      const result = await searchService.searchGrants(
        {
          query: 'funding',
          regions: ['ES'],
          minAmount: 20000,
          maxAmount: 80000,
        },
        { skip: 0, take: 20 },
      );

      expect(result.data.length).toBeGreaterThan(0);
      expect(
        result.data.every((g) => {
          const hasKeyword =
            g.title.toLowerCase().includes('funding') ||
            g.description.toLowerCase().includes('funding');
          const amount = parseFloat(g.amount.toString());
          return (
            g.region === 'ES' &&
            amount >= 20000 &&
            amount <= 80000 &&
            hasKeyword
          );
        }),
      ).toBe(true);
    });
  });

  // ==================== Deadline Range Filter Tests ====================

  describe('Deadline Range Filters', () => {
    it('should filter by deadline after date', async () => {
      const result = await searchService.searchGrants(
        { deadlineAfter: '2026-09-01' },
        { skip: 0, take: 20 },
      );

      expect(result.data.length).toBeGreaterThan(0);
      expect(
        result.data.every((g) => new Date(g.deadline) > new Date('2026-09-01')),
      ).toBe(true);
    });

    it('should filter by deadline before date', async () => {
      const result = await searchService.searchGrants(
        { deadlineBefore: '2026-07-01' },
        { skip: 0, take: 20 },
      );

      expect(result.data.length).toBeGreaterThan(0);
      expect(
        result.data.every((g) => new Date(g.deadline) < new Date('2026-07-01')),
      ).toBe(true);
    });

    it('should filter by deadline range', async () => {
      const result = await searchService.searchGrants(
        {
          deadlineAfter: '2026-06-01',
          deadlineBefore: '2026-10-01',
        },
        { skip: 0, take: 20 },
      );

      expect(result.data.length).toBeGreaterThan(0);
      expect(
        result.data.every((g) => {
          const deadline = new Date(g.deadline);
          return deadline > new Date('2026-06-01') && deadline < new Date('2026-10-01');
        }),
      ).toBe(true);
    });

    it('should combine deadline range with region filter', async () => {
      const result = await searchService.searchGrants(
        {
          regions: ['ES'],
          deadlineAfter: '2026-07-01',
          deadlineBefore: '2026-12-31',
        },
        { skip: 0, take: 20 },
      );

      expect(result.data.length).toBeGreaterThan(0);
      expect(
        result.data.every((g) => {
          const deadline = new Date(g.deadline);
          return (
            g.region === 'ES' &&
            deadline > new Date('2026-07-01') &&
            deadline < new Date('2026-12-31')
          );
        }),
      ).toBe(true);
    });
  });

  // ==================== Pagination Tests ====================

  describe('Pagination Tests', () => {
    it('should return results with default pagination (skip: 0, take: 20)', async () => {
      const result = await searchService.searchGrants({}, { skip: 0, take: 20 });

      expect(result.skip).toBe(0);
      expect(result.take).toBe(20);
      expect(result.data.length).toBeLessThanOrEqual(20);
      expect(result.currentPage).toBe(1);
    });

    it('should respect take parameter', async () => {
      const result = await searchService.searchGrants({}, { skip: 0, take: 5 });

      expect(result.take).toBe(5);
      expect(result.data.length).toBeLessThanOrEqual(5);
    });

    it('should enforce maximum page size (max 100)', async () => {
      const result = await searchService.searchGrants(
        {},
        { skip: 0, take: 200 },
      );

      expect(result.take).toBe(100);
      expect(result.data.length).toBeLessThanOrEqual(100);
    });

    it('should calculate pagination metadata correctly', async () => {
      const result = await searchService.searchGrants({}, { skip: 0, take: 5 });

      expect(result.currentPage).toBe(1);
      expect(result.totalPages).toBe(Math.ceil(result.total / 5));
    });

    it('should return correct page with skip and take', async () => {
      const page1 = await searchService.searchGrants({}, { skip: 0, take: 5 });
      const page2 = await searchService.searchGrants({}, { skip: 5, take: 5 });

      expect(page2.currentPage).toBe(2);
      // Verify different results on different pages
      if (page1.total > 5 && page2.total > 0) {
        const firstPageIds = page1.data.map((g) => g.id);
        const secondPageIds = page2.data.map((g) => g.id);
        const overlap = firstPageIds.filter((id) => secondPageIds.includes(id));
        expect(overlap.length).toBe(0);
      }
    });

    it('should handle skip beyond total results', async () => {
      const result = await searchService.searchGrants(
        {},
        { skip: 10000, take: 20 },
      );

      expect(result.data.length).toBe(0);
      expect(result.skip).toBe(10000);
    });

    it('should calculate correct totalPages', async () => {
      const result = await searchService.searchGrants({}, { skip: 0, take: 10 });

      const expectedTotalPages = Math.ceil(result.total / 10);
      expect(result.totalPages).toBe(expectedTotalPages);
    });
  });

  // ==================== Edge Cases & Error Handling ====================

  describe('Edge Cases', () => {
    it('should return all grants without any filters', async () => {
      const result = await searchService.searchGrants(
        {},
        { skip: 0, take: 100 },
      );

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should handle empty array filters gracefully', async () => {
      const result = await searchService.searchGrants(
        { regions: [] },
        { skip: 0, take: 20 },
      );

      // Empty array should not apply filter
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should return results sorted by createdAt DESC', async () => {
      const result = await searchService.searchGrants({}, { skip: 0, take: 100 });

      if (result.data.length > 1) {
        for (let i = 0; i < result.data.length - 1; i++) {
          const current = new Date(result.data[i].createdAt).getTime();
          const next = new Date(result.data[i + 1].createdAt).getTime();
          // Current should be >= next (DESC order)
          expect(current).toBeGreaterThanOrEqual(next);
        }
      }
    });

    it('should handle boundary amount values', async () => {
      const result = await searchService.searchGrants(
        { minAmount: 5000, maxAmount: 250000 },
        { skip: 0, take: 100 },
      );

      expect(result.data.length).toBeGreaterThan(0);
      expect(
        result.data.every((g) => {
          const amount = parseFloat(g.amount.toString());
          return amount >= 5000 && amount <= 250000;
        }),
      ).toBe(true);
    });

    it('should include source relationship', async () => {
      const result = await searchService.searchGrants({}, { skip: 0, take: 1 });

      expect(result.data.length).toBeGreaterThan(0);
      const grant = result.data[0];
      expect(grant.source).toBeDefined();
      expect(grant.source.id).toBeDefined();
      expect(grant.source.name).toBeDefined();
    });

    it('should maintain data integrity with multiple searches', async () => {
      const result1 = await searchService.searchGrants(
        { regions: ['ES'] },
        { skip: 0, take: 20 },
      );
      const result2 = await searchService.searchGrants(
        { regions: ['ES'] },
        { skip: 0, take: 20 },
      );

      expect(result1.total).toBe(result2.total);
      expect(result1.data.length).toBe(result2.data.length);
      // Verify same grants returned in same order
      result1.data.forEach((grant1, index) => {
        expect(grant1.id).toBe(result2.data[index].id);
      });
    });
  });

  // ==================== Error Handling Tests ====================

  describe('Error Handling', () => {
    it('should throw on negative skip parameter', async () => {
      await expect(
        searchService.searchGrants({}, { skip: -1, take: 20 }),
      ).rejects.toThrow();
    });

    it('should throw on zero or negative take parameter', async () => {
      await expect(
        searchService.searchGrants({}, { skip: 0, take: 0 }),
      ).rejects.toThrow();
    });

    it('should throw on empty search query', async () => {
      await expect(
        searchService.searchGrants({ query: '' }),
      ).rejects.toThrow();
    });

    it('should throw on whitespace-only search query', async () => {
      await expect(
        searchService.searchGrants({ query: '   ' }),
      ).rejects.toThrow();
    });

    it('should throw on excessively long search query', async () => {
      const longQuery = 'a'.repeat(501);
      await expect(
        searchService.searchGrants({ query: longQuery }),
      ).rejects.toThrow();
    });

    it('should throw on negative minAmount', async () => {
      await expect(
        searchService.searchGrants({ minAmount: -100 }),
      ).rejects.toThrow();
    });

    it('should throw on negative maxAmount', async () => {
      await expect(
        searchService.searchGrants({ maxAmount: -100 }),
      ).rejects.toThrow();
    });

    it('should throw when minAmount > maxAmount', async () => {
      await expect(
        searchService.searchGrants({ minAmount: 100000, maxAmount: 10000 }),
      ).rejects.toThrow();
    });

    it('should throw on invalid deadlineAfter format', async () => {
      await expect(
        searchService.searchGrants({ deadlineAfter: 'not-a-date' }),
      ).rejects.toThrow();
    });

    it('should throw on invalid deadlineBefore format', async () => {
      await expect(
        searchService.searchGrants({ deadlineBefore: 'invalid-date' }),
      ).rejects.toThrow();
    });

    it('should throw when deadlineAfter >= deadlineBefore', async () => {
      await expect(
        searchService.searchGrants({
          deadlineAfter: '2026-12-31',
          deadlineBefore: '2026-12-31',
        }),
      ).rejects.toThrow();
    });

    it('should handle invalid region without throwing', async () => {
      const result = await searchService.searchGrants(
        { regions: ['INVALID_REGION'] },
        { skip: 0, take: 20 },
      );

      expect(result.data.length).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  // ==================== Performance & Data Integrity Tests ====================

  describe('Performance & Data Integrity', () => {
    it('should complete search in reasonable time', async () => {
      const startTime = Date.now();
      await searchService.searchGrants({}, { skip: 0, take: 100 });
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should handle multiple filters without N+1 queries', async () => {
      const result = await searchService.searchGrants(
        {
          regions: ['ES'],
          minAmount: 25000,
          maxAmount: 100000,
          deadlineAfter: '2026-06-01',
        },
        { skip: 0, take: 20 },
      );

      // Verify source data is loaded (no separate query needed)
      result.data.forEach((grant) => {
        expect(grant.source).toBeDefined();
      });
    });

    it('should verify numeric precision for amounts', async () => {
      const result = await searchService.searchGrants(
        { minAmount: 50000, maxAmount: 50000 },
        { skip: 0, take: 20 },
      );

      if (result.data.length > 0) {
        result.data.forEach((grant) => {
          const amount = parseFloat(grant.amount.toString());
          expect(amount).toBe(50000);
        });
      }
    });

    it('should return correct data types for all fields', async () => {
      const result = await searchService.searchGrants({}, { skip: 0, take: 1 });

      if (result.data.length > 0) {
        const grant = result.data[0];
        expect(typeof grant.id).toBe('string');
        expect(typeof grant.title).toBe('string');
        expect(typeof grant.description).toBe('string');
        expect(typeof grant.region).toBe('string');
        expect(grant.deadline instanceof Date).toBe(true);
        expect(grant.createdAt instanceof Date).toBe(true);
      }
    });

    it('should handle large result sets efficiently', async () => {
      const result = await searchService.searchGrants(
        {},
        { skip: 0, take: 100 },
      );

      // Even with 100 items, should complete quickly
      expect(result.data.length).toBeLessThanOrEqual(100);
      expect(result.take).toBe(100);
    });
  });

  // ==================== Complex Filter Combinations ====================

  describe('Complex Filter Combinations', () => {
    it('should handle 3+ simultaneous filters', async () => {
      const result = await searchService.searchGrants(
        {
          regions: ['EU', 'ES'],
          minAmount: 50000,
          deadlineAfter: '2026-06-01',
        },
        { skip: 0, take: 20 },
      );

      expect(
        result.data.every((g) => {
          const amount = parseFloat(g.amount.toString());
          return (
            ['EU', 'ES'].includes(g.region) &&
            amount >= 50000 &&
            new Date(g.deadline) > new Date('2026-06-01')
          );
        }),
      ).toBe(true);
    });

    it('should combine all available filters', async () => {
      const result = await searchService.searchGrants(
        {
          query: 'project',
          regions: ['ES', 'EU', 'INT'],
          minAmount: 25000,
          maxAmount: 150000,
          deadlineAfter: '2026-05-01',
          deadlineBefore: '2026-11-30',
        },
        { skip: 0, take: 20 },
      );

      expect(
        result.data.every((g) => {
          const amount = parseFloat(g.amount.toString());
          const deadline = new Date(g.deadline);
          const hasKeyword =
            g.title.toLowerCase().includes('project') ||
            g.description.toLowerCase().includes('project');
          return (
            ['ES', 'EU', 'INT'].includes(g.region) &&
            amount >= 25000 &&
            amount <= 150000 &&
            deadline > new Date('2026-05-01') &&
            deadline < new Date('2026-11-30') &&
            hasKeyword
          );
        }),
      ).toBe(true);
    });

    it('should return consistent results with different take values', async () => {
      const result20 = await searchService.searchGrants(
        { regions: ['ES'] },
        { skip: 0, take: 20 },
      );
      const result10 = await searchService.searchGrants(
        { regions: ['ES'] },
        { skip: 0, take: 10 },
      );

      expect(result20.total).toBe(result10.total);
      // First 10 results should be identical
      result10.data.forEach((grant, index) => {
        expect(grant.id).toBe(result20.data[index].id);
      });
    });

    it('should maintain correct page metadata across combinations', async () => {
      const filters: SearchFiltersDto = {
        regions: ['EU'],
        minAmount: 60000,
      };

      const page1 = await searchService.searchGrants(filters, {
        skip: 0,
        take: 5,
      });
      const page2 = await searchService.searchGrants(filters, {
        skip: 5,
        take: 5,
      });

      expect(page1.currentPage).toBe(1);
      expect(page2.currentPage).toBe(2);
      expect(page1.totalPages).toBe(Math.ceil(page1.total / 5));
      expect(page2.totalPages).toBe(Math.ceil(page2.total / 5));
    });
  });
});
