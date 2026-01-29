import pdf from 'pdf-parse';
import { PdfHandler } from './pdf.handler';
import { SourceEntity } from '../../database/entities/source.entity';
import { SourceType } from '../../common/enums/source-type.enum';

jest.mock('pdf-parse', () => jest.fn());

describe('PdfHandler', () => {
  let handler: PdfHandler;

  beforeEach(() => {
    handler = new PdfHandler();
    (global as any).fetch = jest.fn();
  });

  it('should handle PDF sources', () => {
    const source = { type: SourceType.PDF } as SourceEntity;
    expect(handler.canHandle(source)).toBe(true);
  });

  it('should parse PDF content into a grant', async () => {
    const fetchMock = (global as any).fetch as jest.Mock;
    fetchMock.mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
    });

    const pdfMock = pdf as unknown as jest.Mock;
    pdfMock.mockResolvedValue({ text: 'Grant Title\nGrant description' });

    const result = await handler.scrape({
      type: SourceType.PDF,
      url: 'https://example.com/grants.pdf',
    } as SourceEntity);

    expect(result.method).toBe('pdf');
    expect(result.grants).toHaveLength(1);
    expect(result.grants[0].title).toBe('Grant Title');
  });
});
