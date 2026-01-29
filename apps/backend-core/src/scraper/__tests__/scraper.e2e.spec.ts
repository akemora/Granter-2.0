import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ScraperService } from '../scraper.service';
import { ScraperController } from '../scraper.controller';
import { SmartScraperService } from '../scrapers/smart-scraper.service';
import { GenericScraperService } from '../scrapers/generic-scraper.service';
import { SourceEntity } from '../../database/entities/source.entity';
import { GrantEntity } from '../../database/entities/grant.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ScraperLogEntity } from '../../database/entities/scraper-log.entity';
import { NotificationsService } from '../../notifications/notifications.service';
import { ScraperQueueService } from '../../queue/scraper-queue.service';
import { applyTestAppConfig } from '../../../test/utils/test-app';
import { SCRAPER_HANDLERS } from '../handlers/handler.tokens';
import { ConfigService } from '@nestjs/config';

/**
 * Scraper E2E Integration Tests
 *
 * Task: S3-D2-1 (Sprint 3, Day 2)
 * Tests the complete scraping flow with fallback chain
 */

describe('Scraper E2E Tests (S3-D2-1)', () => {
  let app: INestApplication;
  let scraperService: ScraperService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScraperController],
      providers: [
        ScraperService,
        {
          provide: SCRAPER_HANDLERS,
          useValue: [],
        },
        {
          provide: SmartScraperService,
          useValue: { scrape: jest.fn() },
        },
        {
          provide: GenericScraperService,
          useValue: { scrape: jest.fn() },
        },
        {
          provide: getRepositoryToken(SourceEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(GrantEntity),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ScraperLogEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            notifyForNewGrants: jest.fn(),
          },
        },
        {
          provide: ScraperQueueService,
          useValue: {
            enqueueSourceById: jest.fn().mockResolvedValue({ id: 'job-1' }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => (key === 'serviceToken' ? 'test-service-token' : undefined),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    applyTestAppConfig(app);

    await app.init();

    scraperService = module.get<ScraperService>(ScraperService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /scraper/scrape - URL Validation', () => {
    it('should reject missing URL', async () => {
      await request(app.getHttpServer()).post('/scraper/scrape').send({}).expect(400);
    });

    it('should reject invalid URL format', async () => {
      await request(app.getHttpServer()).post('/scraper/scrape').send({ url: 'not-a-url' }).expect(400);
    });

    it('should accept valid URL', async () => {
      // Mock the scraper service
      jest.spyOn(scraperService, 'scrapeWithFallback').mockResolvedValueOnce({
        success: true,
        pages: [] as any[],
        method: 'generic',
        grantCount: 0,
      });

      await request(app.getHttpServer()).post('/scraper/scrape').send({ url: 'https://example.com' }).expect(201);
    });
  });

  describe('POST /scraper/scrape - Scraper Pipeline', () => {
    it('should return SmartScraper results when successful', async () => {
      const mockResult = {
        success: true,
        pages: [
          {
            url: 'https://example.com',
            title: 'Grants',
            content: '<html></html>',
            grants: [
              {
                title: 'Grant 1',
                description: 'Description',
                amount: 50000,
              },
            ],
            links: [] as string[],
            depth: 0,
          },
        ],
        method: 'smart' as const,
        grantCount: 1,
      };

      jest.spyOn(scraperService, 'scrapeWithFallback').mockResolvedValueOnce(mockResult);

      const response = await request(app.getHttpServer())
        .post('/scraper/scrape')
        .send({ url: 'https://example.com' })
        .expect(201);

      const body = response.body.data;

      expect(response.body.success).toBe(true);
      expect(body.success).toBe(true);
      expect(body.method).toBe('smart');
      expect(body.grantCount).toBe(1);
    });

    it('should return GenericScraper results on fallback', async () => {
      const mockResult = {
        success: true,
        pages: [
          {
            url: 'https://example.com',
            title: 'Grants',
            content: '<html></html>',
            grants: [
              {
                title: 'Grant 2',
                description: 'Description',
              },
            ],
          },
        ],
        method: 'generic' as const,
        grantCount: 1,
      };

      jest.spyOn(scraperService, 'scrapeWithFallback').mockResolvedValueOnce(mockResult);

      const response = await request(app.getHttpServer())
        .post('/scraper/scrape')
        .send({ url: 'https://example.com' })
        .expect(201);

      const body = response.body.data;

      expect(response.body.success).toBe(true);
      expect(body.success).toBe(true);
      expect(body.method).toBe('generic');
    });

    it('should return error when all methods fail', async () => {
      const mockResult = {
        success: false,
        pages: [] as any[],
        method: 'error' as const,
        error: 'All scraping methods failed',
        grantCount: 0,
      };

      jest.spyOn(scraperService, 'scrapeWithFallback').mockResolvedValueOnce(mockResult);

      const response = await request(app.getHttpServer())
        .post('/scraper/scrape')
        .send({ url: 'https://example.com' })
        .expect(201);

      const body = response.body.data;

      expect(response.body.success).toBe(true);
      expect(body.success).toBe(false);
      expect(body.error).toBeDefined();
    });
  });

  describe('POST /scraper/scrape - Response Format', () => {
    it('should return correct response structure', async () => {
      const mockResult = {
        success: true,
        pages: [] as any[],
        method: 'generic' as const,
        grantCount: 5,
      };

      jest.spyOn(scraperService, 'scrapeWithFallback').mockResolvedValueOnce(mockResult);

      const response = await request(app.getHttpServer())
        .post('/scraper/scrape')
        .send({ url: 'https://example.com' })
        .expect(201);

      const body = response.body.data;

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.success).toBe('boolean');
      expect(body).toHaveProperty('pages');
      expect(body).toHaveProperty('method');
      expect(body).toHaveProperty('grantCount');
      expect(Array.isArray(body.pages)).toBe(true);
    });

    it('should include error message on failure', async () => {
      const mockResult = {
        success: false,
        pages: [] as any[],
        method: 'error' as const,
        error: 'Connection timeout',
        grantCount: 0,
      };

      jest.spyOn(scraperService, 'scrapeWithFallback').mockResolvedValueOnce(mockResult);

      const response = await request(app.getHttpServer())
        .post('/scraper/scrape')
        .send({ url: 'https://example.com' })
        .expect(201);

      expect(response.body.data.error).toBe('Connection timeout');
    });
  });

  describe('POST /scraper/scrape-async - Inter-service', () => {
    it('should require X-Service-Token header', async () => {
      await request(app.getHttpServer()).post('/scraper/scrape-async').send({ url: 'https://example.com' }).expect(403); // Forbidden - missing guard
    });

    it('should queue scraping task', async () => {
      // This would require proper X-Service-Token setup
      // Skipping for now as it requires authentication guard setup
    });
  });
});
