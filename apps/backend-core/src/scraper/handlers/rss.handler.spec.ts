import { RssHandler } from './rss.handler';
import { SourceType } from '../../common/enums/source-type.enum';
import { SourceEntity } from '../../database/entities/source.entity';

const parseURL = jest.fn();

jest.mock('rss-parser', () => {
  return jest.fn().mockImplementation(() => ({
    parseURL,
  }));
});

describe('RssHandler', () => {
  let handler: RssHandler;

  beforeEach(() => {
    handler = new RssHandler();
    parseURL.mockReset();
  });

  it('handles RSS sources', () => {
    const source = { type: SourceType.RSS } as SourceEntity;
    expect(handler.canHandle(source)).toBe(true);
  });

  it('maps RSS items to grants', async () => {
    parseURL.mockResolvedValue({
      items: [
        {
          title: 'Grant RSS',
          contentSnippet: 'Grant description',
          link: 'https://example.com/rss',
        },
      ],
    });

    const result = await handler.scrape({
      type: SourceType.RSS,
      url: 'https://example.com/rss.xml',
    } as SourceEntity);

    expect(result.method).toBe('rss');
    expect(result.grants).toHaveLength(1);
    expect(result.grants[0]).toMatchObject({
      title: 'Grant RSS',
      description: 'Grant description',
      url: 'https://example.com/rss',
    });
  });

  it('returns error when RSS parsing fails', async () => {
    parseURL.mockRejectedValue(new Error('parse failed'));

    const result = await handler.scrape({
      type: SourceType.RSS,
      url: 'https://example.com/rss.xml',
    } as SourceEntity);

    expect(result.method).toBe('rss');
    expect(result.error).toContain('parse failed');
    expect(result.grants).toHaveLength(0);
  });
});
