import { SourceEntity } from '../../database/entities/source.entity';
import { SourceHandlerResult } from '../scraper.types';

export interface SourceHandler {
  canHandle(source: SourceEntity): boolean;
  scrape(source: SourceEntity): Promise<SourceHandlerResult>;
}
