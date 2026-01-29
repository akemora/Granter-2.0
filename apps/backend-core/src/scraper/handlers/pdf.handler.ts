import { Injectable, Logger } from '@nestjs/common';
import pdf from 'pdf-parse';
import { SourceEntity } from '../../database/entities/source.entity';
import { SourceType } from '../../common/enums/source-type.enum';
import { GrantStatus } from '../../common/enums/grant-status.enum';
import { SourceHandler } from './source-handler.interface';
import { ScrapedGrant, SourceHandlerResult } from '../scraper.types';

@Injectable()
export class PdfHandler implements SourceHandler {
  private readonly logger = new Logger(PdfHandler.name);

  canHandle(source: SourceEntity): boolean {
    return source.type === SourceType.PDF;
  }

  async scrape(source: SourceEntity): Promise<SourceHandlerResult> {
    try {
      const buffer = await this.fetchPdf(source.url);
      const parsed = await pdf(buffer);
      const grants = this.extractGrants(parsed.text ?? '', source.url);
      return { grants, method: 'pdf' };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`PDF handler failed for ${source.url}: ${message}`);
      return { grants: [], method: 'error', error: message };
    }
  }

  private async fetchPdf(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }
    const data = await response.arrayBuffer();
    return Buffer.from(data);
  }

  private extractGrants(text: string, url: string): ScrapedGrant[] {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      return [];
    }
    const title = lines[0].slice(0, 180);
    const description = this.compactText(lines.join(' ')).slice(0, 2000);
    return [
      {
        title,
        description,
        url,
        status: GrantStatus.OPEN,
      },
    ];
  }

  private compactText(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }
}
