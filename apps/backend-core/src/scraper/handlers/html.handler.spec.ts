import { HtmlHandler } from './html.handler';
import { SourceEntity } from '../../database/entities/source.entity';
import { SourceType } from '../../common/enums/source-type.enum';
import { SmartScraperService } from '../scrapers/smart-scraper.service';
import { GenericScraperService } from '../scrapers/generic-scraper.service';

const buildSource = (overrides: Partial<SourceEntity> = {}) =>
  ({
    id: 'source-1',
    type: SourceType.HTML,
    url: 'https://example.com',
    name: 'Example',
    metadata: {},
    ...overrides,
  }) as SourceEntity;

describe('HtmlHandler', () => {
  let smartScraper: jest.Mocked<SmartScraperService>;
  let genericScraper: jest.Mocked<GenericScraperService>;
  let handler: HtmlHandler;

  beforeEach(() => {
    smartScraper = {
      scrape: jest.fn(),
    } as unknown as jest.Mocked<SmartScraperService>;
    genericScraper = {
      scrape: jest.fn(),
    } as unknown as jest.Mocked<GenericScraperService>;

    handler = new HtmlHandler(smartScraper, genericScraper);
    (global as any).fetch = jest.fn();
  });

  it('handles HTML sources', () => {
    const source = buildSource();
    expect(handler.canHandle(source)).toBe(true);
  });

  it('uses SmartScraper when available', async () => {
    smartScraper.scrape.mockResolvedValue([
      {
        url: 'https://example.com',
        content: '<html></html>',
        grants: [{ title: 'Grant', description: 'Desc' }],
      },
    ] as any);

    const result = await handler.scrape(buildSource());

    expect(result.method).toBe('smart');
    expect(result.grants).toHaveLength(1);
    expect(genericScraper.scrape).not.toHaveBeenCalled();
  });

  it('falls back to GenericScraper when SmartScraper fails', async () => {
    smartScraper.scrape.mockRejectedValue(new Error('smart failed'));
    genericScraper.scrape.mockResolvedValue({
      url: 'https://example.com',
      title: 'Page',
      content: '<html></html>',
      grants: [{ title: 'Grant G', description: 'Desc G' }],
    } as any);

    const result = await handler.scrape(buildSource());

    expect(result.method).toBe('generic');
    expect(result.grants).toHaveLength(1);
  });

  it('returns error when all scrapers fail', async () => {
    smartScraper.scrape.mockRejectedValue(new Error('smart failed'));
    genericScraper.scrape.mockRejectedValue(new Error('generic failed'));

    const result = await handler.scrape(buildSource());

    expect(result.method).toBe('error');
    expect(result.error).toContain('generic failed');
    expect(result.grants).toHaveLength(0);
  });

  it('enhances grants with IA when enabled', async () => {
    smartScraper.scrape.mockResolvedValue([
      {
        url: 'https://example.com',
        content: '<html><body>Example</body></html>',
        grants: [{ title: 'Grant Base', description: 'Base desc', url: 'https://example.com' }],
      },
    ] as any);

    const fetchMock = (global as any).fetch as jest.Mock;
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: {
          title: 'Grant IA',
          description: 'IA desc',
          amount: 500,
          deadline: '2026-12-31',
          url: 'https://example.com/ia',
        },
      }),
    });

    const result = await handler.scrape(buildSource({ metadata: { iaExtraction: true } as any }));

    expect(result.method).toBe('smart');
    expect(result.grants.some((grant) => grant.title === 'Grant IA')).toBe(true);
  });
});
