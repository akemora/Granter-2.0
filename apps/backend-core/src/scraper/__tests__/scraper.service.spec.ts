import { Test, TestingModule } from '@nestjs/testing';
import { ScraperService } from '../scraper.service';
import { SmartScraperService } from '../scrapers/smart-scraper.service';
import { GenericScraperService } from '../scrapers/generic-scraper.service';

describe('ScraperService', () => {
  let service: ScraperService;
  let smartScraper: SmartScraperService;
  let genericScraper: GenericScraperService;

  const testUrl = 'https://example.com/grants';

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

      jest
        .spyOn(smartScraper, 'scrape')
        .mockRejectedValueOnce(new Error('Timeout after 30000ms'));
      jest.spyOn(genericScraper, 'scrape').mockResolvedValueOnce(mockPage);

      const result = await service.scrapeWithFallback(testUrl);

      expect(result.success).toBe(true);
      expect(result.method).toBe('generic');
      expect(genericScraper.scrape).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle invalid URLs', async () => {
      jest
        .spyOn(smartScraper, 'scrape')
        .mockRejectedValueOnce(new Error('Invalid URL'));
      jest
        .spyOn(genericScraper, 'scrape')
        .mockRejectedValueOnce(new Error('Invalid URL'));

      const result = await service.scrapeWithFallback('not-a-url');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid');
    });

    it('should handle network errors', async () => {
      jest
        .spyOn(smartScraper, 'scrape')
        .mockRejectedValueOnce(new Error('Network error'));
      jest
        .spyOn(genericScraper, 'scrape')
        .mockRejectedValueOnce(new Error('Network error'));

      const result = await service.scrapeWithFallback(testUrl);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
