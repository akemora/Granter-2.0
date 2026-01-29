import { Injectable, Logger } from '@nestjs/common';
import Parser from 'rss-parser';
import { SourceEntity } from '../../database/entities/source.entity';
import { SourceType } from '../../common/enums/source-type.enum';
import { SourceHandler } from './source-handler.interface';
import { ScrapedGrant, SourceHandlerResult } from '../scraper.types';

@Injectable()
export class RssHandler implements SourceHandler {
  private readonly logger = new Logger(RssHandler.name);
  private readonly parser = new Parser();

  canHandle(source: SourceEntity): boolean {
    return source.type === SourceType.RSS;
  }

  async scrape(source: SourceEntity): Promise<SourceHandlerResult> {
    try {
      const feed = await this.parser.parseURL(source.url);
      const grants = (feed.items ?? [])
        .map((item) => this.mapItemToGrant(item, source))
        .filter((grant): grant is ScrapedGrant => Boolean(grant));

      return { grants, method: 'rss' };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`RSS handler failed for ${source.url}: ${message}`);
      return { grants: [], method: 'rss', error: message };
    }
  }

  private mapItemToGrant(item: Parser.Item, source: SourceEntity): ScrapedGrant | null {
    const title = item.title?.trim();
    const description = (item.contentSnippet ?? item.content ?? '').trim();

    if (!title || !description) {
      return null;
    }

    return {
      title,
      description,
      url: item.link ?? source.url,
    };
  }
}
