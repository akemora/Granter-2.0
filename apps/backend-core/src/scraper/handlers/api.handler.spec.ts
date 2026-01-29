import { ApiHandler } from './api.handler';
import { SourceType } from '../../common/enums/source-type.enum';
import { SourceEntity } from '../../database/entities/source.entity';

describe('ApiHandler', () => {
  let handler: ApiHandler;

  beforeEach(() => {
    handler = new ApiHandler();
    (global as any).fetch = jest.fn();
  });

  it('handles API sources', () => {
    const source = { type: SourceType.API } as SourceEntity;
    expect(handler.canHandle(source)).toBe(true);
  });

  it('maps API response to grants using metadata mapping', async () => {
    const fetchMock = (global as any).fetch as jest.Mock;
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: [
          {
            titulo: 'Grant A',
            resumen: 'Desc A',
            presupuesto: '1,000',
            cierre: '2026-12-31',
            enlace: 'https://example.com/a',
          },
        ],
      }),
    });

    const source = {
      type: SourceType.API,
      url: 'https://api.example.com',
      metadata: {
        api: {
          endpoint: 'https://api.example.com/grants',
          dataPath: 'data',
          mapping: {
            title: 'titulo',
            description: 'resumen',
            amount: 'presupuesto',
            deadline: 'cierre',
            url: 'enlace',
          },
        },
      },
    } as unknown as SourceEntity;

    const result = await handler.scrape(source);

    expect(result.method).toBe('api');
    expect(result.grants).toHaveLength(1);
    expect(result.grants[0]).toMatchObject({
      title: 'Grant A',
      description: 'Desc A',
      amount: 1000,
      deadline: '2026-12-31',
      url: 'https://example.com/a',
    });
  });

  it('returns error when API response is not ok', async () => {
    const fetchMock = (global as any).fetch as jest.Mock;
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue('boom'),
    });

    const result = await handler.scrape({
      type: SourceType.API,
      url: 'https://api.example.com/grants',
    } as SourceEntity);

    expect(result.method).toBe('api');
    expect(result.error).toContain('500');
  });

  it('returns error when fetch throws', async () => {
    const fetchMock = (global as any).fetch as jest.Mock;
    fetchMock.mockRejectedValue(new Error('network'));

    const result = await handler.scrape({
      type: SourceType.API,
      url: 'https://api.example.com/grants',
    } as SourceEntity);

    expect(result.method).toBe('api');
    expect(result.error).toContain('network');
  });
});
