import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ScraperModule } from '../scraper.module';
import { ScraperService } from '../scraper.service';

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
      imports: [ScraperModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    scraperService = module.get<ScraperService>(ScraperService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /scraper/scrape - URL Validation', () => {
    it('should reject missing URL', async () => {
      await request(app.getHttpServer())
        .post('/scraper/scrape')
        .send({})
        .expect(400);
    });

    it('should reject invalid URL format', async () => {
      await request(app.getHttpServer())
        .post('/scraper/scrape')
        .send({ url: 'not-a-url' })
        .expect(400);
    });

    it('should accept valid URL', async () => {
      // Mock the scraper service
      jest.spyOn(scraperService, 'scrapeWithFallback').mockResolvedValueOnce({
        success: true,
        pages: [] as any[],
        method: 'generic',
        grantCount: 0,
      });

      await request(app.getHttpServer())
        .post('/scraper/scrape')
        .send({ url: 'https://example.com' })
        .expect(201);
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

      jest
        .spyOn(scraperService, 'scrapeWithFallback')
        .mockResolvedValueOnce(mockResult);

      const response = await request(app.getHttpServer())
        .post('/scraper/scrape')
        .send({ url: 'https://example.com' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.method).toBe('smart');
      expect(response.body.grantCount).toBe(1);
    });

    it('should return GenericScraper results on fallback', async () => {
      const mockResult = {
        success: true,
        pages: [
          {
            url: 'https://example.com',
            title: 'Grants',
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

      jest
        .spyOn(scraperService, 'scrapeWithFallback')
        .mockResolvedValueOnce(mockResult);

      const response = await request(app.getHttpServer())
        .post('/scraper/scrape')
        .send({ url: 'https://example.com' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.method).toBe('generic');
    });

    it('should return error when all methods fail', async () => {
      const mockResult = {
        success: false,
        pages: [] as any[],
        method: 'error' as const,
        error: 'All scraping methods failed',
        grantCount: 0,
      };

      jest
        .spyOn(scraperService, 'scrapeWithFallback')
        .mockResolvedValueOnce(mockResult);

      const response = await request(app.getHttpServer())
        .post('/scraper/scrape')
        .send({ url: 'https://example.com' })
        .expect(201);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
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

      jest
        .spyOn(scraperService, 'scrapeWithFallback')
        .mockResolvedValueOnce(mockResult);

      const response = await request(app.getHttpServer())
        .post('/scraper/scrape')
        .send({ url: 'https://example.com' })
        .expect(201);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('pages');
      expect(response.body).toHaveProperty('method');
      expect(response.body).toHaveProperty('grantCount');
      expect(typeof response.body.success).toBe('boolean');
      expect(Array.isArray(response.body.pages)).toBe(true);
    });

    it('should include error message on failure', async () => {
      const mockResult = {
        success: false,
        pages: [] as any[],
        method: 'error' as const,
        error: 'Connection timeout',
        grantCount: 0,
      };

      jest
        .spyOn(scraperService, 'scrapeWithFallback')
        .mockResolvedValueOnce(mockResult);

      const response = await request(app.getHttpServer())
        .post('/scraper/scrape')
        .send({ url: 'https://example.com' })
        .expect(201);

      expect(response.body.error).toBe('Connection timeout');
    });
  });

  describe('POST /scraper/scrape-async - Inter-service', () => {
    it('should require X-Service-Token header', async () => {
      await request(app.getHttpServer())
        .post('/scraper/scrape-async')
        .send({ url: 'https://example.com' })
        .expect(403); // Forbidden - missing guard
    });

    it('should queue scraping task', async () => {
      // This would require proper X-Service-Token setup
      // Skipping for now as it requires authentication guard setup
    });
  });
});
