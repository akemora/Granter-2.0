import { Test, TestingModule } from '@nestjs/testing';
import { ScraperService } from '../scraper.service';
import { SmartScraperService } from '../scrapers/smart-scraper.service';
import { GenericScraperService } from '../scrapers/generic-scraper.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SourceEntity } from '../../database/entities/source.entity';
import { GrantEntity } from '../../database/entities/grant.entity';
import { ScraperLogEntity } from '../../database/entities/scraper-log.entity';
import { NotificationsService } from '../../notifications/notifications.service';
import { SCRAPER_HANDLERS } from '../handlers/handler.tokens';

describe('ScraperService', () => {
  let service: ScraperService;
  let smartScraper: SmartScraperService;
  let genericScraper: GenericScraperService;
  let scraperLogsRepository: { find: jest.Mock };

  const testUrl = 'https://example.com/grants';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScraperService,
        {
          provide: SCRAPER_HANDLERS,
          useValue: [],
        },
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
            find: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            notifyForNewGrants: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ScraperService>(ScraperService);
    smartScraper = module.get<SmartScraperService>(SmartScraperService);
    genericScraper = module.get<GenericScraperService>(GenericScraperService);
    scraperLogsRepository = module.get(getRepositoryToken(ScraperLogEntity));
  });

  describe('getLogsForSource', () => {
    it('should return recent logs with capped limit', async () => {
      const logs = [
        { id: 'log-1', status: 'success', timestamp: new Date() },
        { id: 'log-2', status: 'error', timestamp: new Date() },
      ];
      scraperLogsRepository.find.mockResolvedValueOnce(logs);

      const result = await service.getLogsForSource('source-1', 100);

      expect(result).toEqual(logs);
      expect(scraperLogsRepository.find).toHaveBeenCalledWith({
        where: { source: { id: 'source-1' } },
        order: { timestamp: 'DESC' },
        take: 50,
      });
    });
  });

  describe('scrapeWithFallback', () => {
    it('should use SmartScraper first', async () => {
      const mockPages = [
        {
          url: testUrl,
          title: 'Grants Page',
          content: '<html><body></body></html>',
          grants: [
            {
              url: 'https://example.com/grant/1',
              title: 'Grant 1',
              description: 'Test grant',
              amount: 50000,
            },
          ],
          links: [] as string[],
          depth: 0,
        },
      ];

      jest.spyOn(smartScraper, 'scrape').mockResolvedValue(mockPages);

      const result = await service.scrapeWithFallback(testUrl);

      expect(result.success).toBe(true);
      expect(result.method).toBe('smart');
      expect(result.grantCount).toBe(1);
      expect(smartScraper.scrape).toHaveBeenCalledWith(testUrl);
    });

    it('should fallback to GenericScraper when SmartScraper fails', async () => {
      const mockPage = {
        url: testUrl,
        title: 'Grants Page',
        content: '<html><body></body></html>',
        grants: [
          {
            url: 'https://example.com/grant/2',
            title: 'Grant 2',
            description: 'Test grant 2',
          },
        ],
      };

      jest.spyOn(smartScraper, 'scrape').mockRejectedValueOnce(new Error('SmartScraper error'));
      jest.spyOn(genericScraper, 'scrape').mockResolvedValueOnce(mockPage);

      const result = await service.scrapeWithFallback(testUrl);

      expect(result.success).toBe(true);
      expect(result.method).toBe('generic');
      expect(result.grantCount).toBe(1);
      expect(smartScraper.scrape).toHaveBeenCalledWith(testUrl);
      expect(genericScraper.scrape).toHaveBeenCalledWith(testUrl);
    });

    it('should return error when both scrapers fail', async () => {
      jest.spyOn(smartScraper, 'scrape').mockRejectedValueOnce(new Error('SmartScraper error'));
      jest.spyOn(genericScraper, 'scrape').mockRejectedValueOnce(new Error('GenericScraper error'));

      const result = await service.scrapeWithFallback(testUrl);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.grantCount).toBe(0);
    });

    it('should handle timeout from SmartScraper', async () => {
      const mockPage = {
        url: testUrl,
        title: 'Grants Page',
        content: '<html><body></body></html>',
        grants: [
          {
            url: 'https://example.com/grant/3',
            title: 'Grant 3',
            description: 'Test',
          },
        ],
      };

      jest.spyOn(smartScraper, 'scrape').mockRejectedValueOnce(new Error('Timeout after 30000ms'));
      jest.spyOn(genericScraper, 'scrape').mockResolvedValueOnce(mockPage);

      const result = await service.scrapeWithFallback(testUrl);

      expect(result.success).toBe(true);
      expect(result.method).toBe('generic');
      expect(genericScraper.scrape).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle invalid URLs', async () => {
      jest.spyOn(smartScraper, 'scrape').mockRejectedValueOnce(new Error('Invalid URL'));
      jest.spyOn(genericScraper, 'scrape').mockRejectedValueOnce(new Error('Invalid URL'));

      const result = await service.scrapeWithFallback('not-a-url');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid');
    });

    it('should handle network errors', async () => {
      jest.spyOn(smartScraper, 'scrape').mockRejectedValueOnce(new Error('Network error'));
      jest.spyOn(genericScraper, 'scrape').mockRejectedValueOnce(new Error('Network error'));

      const result = await service.scrapeWithFallback(testUrl);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
