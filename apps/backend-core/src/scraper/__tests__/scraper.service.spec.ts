import { Test, TestingModule } from '@nestjs/testing';
import { ScraperService } from '../scraper.service';
import { SmartScraperService } from '../scrapers/smart-scraper.service';
import { GenericScraperService } from '../scrapers/generic-scraper.service';

/**
 * Scraper Service Tests
 *
 * Task: S3-D1-1 & S3-D1-2 (Sprint 3, Day 1)
 * Test Coverage: SmartScraper + GenericScraper fallback chain
 */

describe('ScraperService', () => {
  let service: ScraperService;
  let smartScraper: SmartScraperService;
  let genericScraper: GenericScraperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScraperService,
        {
          provide: SmartScraperService,
          useValue: {
            scrape: jest.fn(),
          },
        },
        {
          provide: GenericScraperService,
          useValue: {
            scrape: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ScraperService>(ScraperService);
    smartScraper = module.get<SmartScraperService>(SmartScraperService);
    genericScraper = module.get<GenericScraperService>(GenericScraperService);
  });

  describe('scrapeWithFallback', () => {
    const testUrl = 'https://example.com/grants';

    it('should use SmartScraper first', async () => {
      const mockPages = [
        {
          url: testUrl,
          title: 'Grants Page',
          grants: [
            {
              title: 'Grant 1',
              description: 'Test grant',
              amount: 50000,
            },
          ],
          links: [],
          depth: 0,
        },
      ];

      jest.spyOn(smartScraper, 'scrape').mockResolvedValue(mockPages);

      const result = await service.scrapeWithFallback(testUrl);

      expect(result.success).toBe(true);
      expect(result.method).toBe('smart');
      expect(result.pages).toEqual(mockPages);
      expect(result.grantCount).toBe(1);
      expect(smartScraper.scrape).toHaveBeenCalledWith(testUrl);
      expect(genericScraper.scrape).not.toHaveBeenCalled();
    });

    it('should fallback to GenericScraper if SmartScraper fails', async () => {
      const mockPage = {
        url: testUrl,
        title: 'Grants',
        grants: [
          {
            title: 'Grant 2',
            description: 'Fallback grant',
          },
        ],
      };

      jest.spyOn(smartScraper, 'scrape').mockRejectedValueOnce(
        new Error('SmartScraper timeout')
      );

      jest.spyOn(genericScraper, 'scrape').mockResolvedValueOnce(mockPage);

      const result = await service.scrapeWithFallback(testUrl);

      expect(result.success).toBe(true);
      expect(result.method).toBe('generic');
      expect(result.pages).toEqual([mockPage]);
      expect(result.grantCount).toBe(1);
    });

    it('should return error if all scrapers fail', async () => {
      jest.spyOn(smartScraper, 'scrape').mockRejectedValueOnce(
        new Error('SmartScraper failed')
      );

      jest.spyOn(genericScraper, 'scrape').mockRejectedValueOnce(
        new Error('GenericScraper failed')
      );

      const result = await service.scrapeWithFallback(testUrl);

      expect(result.success).toBe(false);
      expect(result.method).toBe('error');
      expect(result.grantCount).toBe(0);
      expect(result.error).toBeDefined();
    });

    it('should extract multiple grants from multiple pages', async () => {
      const mockPages = [
        {
          url: testUrl,
          title: 'Page 1',
          grants: [
            { title: 'Grant 1', description: 'Desc 1' },
            { title: 'Grant 2', description: 'Desc 2' },
          ],
          links: [],
          depth: 0,
        },
        {
          url: `${testUrl}?page=2`,
          title: 'Page 2',
          grants: [{ title: 'Grant 3', description: 'Desc 3' }],
          links: [],
          depth: 1,
        },
      ];

      jest.spyOn(smartScraper, 'scrape').mockResolvedValueOnce(mockPages);

      const result = await service.scrapeWithFallback(testUrl);

      expect(result.grantCount).toBe(3);
      expect(result.pages).toEqual(mockPages);
    });
  });

  describe('getAllGrants', () => {
    it('should extract all grants from successful result', () => {
      const result = {
        success: true,
        pages: [
          {
            url: 'https://example.com',
            title: 'Page 1',
            grants: [
              { title: 'Grant 1', description: 'Desc 1' },
              { title: 'Grant 2', description: 'Desc 2' },
            ],
          },
          {
            url: 'https://example.com?page=2',
            title: 'Page 2',
            grants: [{ title: 'Grant 3', description: 'Desc 3' }],
          },
        ],
        method: 'smart' as const,
        grantCount: 3,
      };

      const grants = service.getAllGrants(result);

      expect(grants).toHaveLength(3);
      expect(grants[0].title).toBe('Grant 1');
      expect(grants[2].title).toBe('Grant 3');
    });

    it('should return empty array for failed result', () => {
      const result = {
        success: false,
        pages: [],
        method: 'error' as const,
        error: 'Failed',
        grantCount: 0,
      };

      const grants = service.getAllGrants(result);

      expect(grants).toEqual([]);
    });
  });
});
