import { Injectable, Logger } from '@nestjs/common';
import { SourceEntity } from '../../database/entities/source.entity';
import { SourceType } from '../../common/enums/source-type.enum';
import { SourceHandler } from './source-handler.interface';
import { ScrapedGrant, SourceHandlerResult } from '../scraper.types';

interface ApiMappingConfig {
  title?: string;
  description?: string;
  amount?: string;
  deadline?: string;
  url?: string;
}

interface ApiSourceMetadata {
  api?: {
    endpoint?: string;
    method?: string;
    headers?: Record<string, string>;
    dataPath?: string;
    mapping?: ApiMappingConfig;
  };
}

@Injectable()
export class ApiHandler implements SourceHandler {
  private readonly logger = new Logger(ApiHandler.name);

  canHandle(source: SourceEntity): boolean {
    return source.type === SourceType.API;
  }

  async scrape(source: SourceEntity): Promise<SourceHandlerResult> {
    const config = this.getApiConfig(source);
    const endpoint = config.endpoint ?? source.url;

    try {
      const response = await fetch(endpoint, {
        method: config.method ?? 'GET',
        headers: config.headers ?? {},
      });

      if (!response.ok) {
        const body = await response.text();
        return {
          grants: [],
          method: 'api',
          error: `API request failed: ${response.status} ${body}`,
        };
      }

      const payload = await response.json();
      const items = this.resolveItems(payload, config.dataPath);
      const grants = items
        .map((item) => this.mapItemToGrant(item, config.mapping, source))
        .filter((grant): grant is ScrapedGrant => Boolean(grant));

      return { grants, method: 'api' };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`API handler failed for ${endpoint}: ${message}`);
      return { grants: [], method: 'api', error: message };
    }
  }

  private getApiConfig(source: SourceEntity) {
    const metadata = (source.metadata ?? {}) as ApiSourceMetadata;
    return {
      endpoint: metadata.api?.endpoint,
      method: metadata.api?.method,
      headers: metadata.api?.headers,
      dataPath: metadata.api?.dataPath,
      mapping: metadata.api?.mapping,
    };
  }

  private resolveItems(payload: unknown, dataPath?: string): unknown[] {
    if (dataPath) {
      const extracted = this.getByPath(payload, dataPath);
      if (Array.isArray(extracted)) {
        return extracted;
      }
    }

    if (Array.isArray(payload)) {
      return payload;
    }

    if (payload && typeof payload === 'object') {
      const candidate = payload as Record<string, unknown>;
      const data = candidate.data ?? candidate.results ?? candidate.items;
      if (Array.isArray(data)) {
        return data;
      }
    }

    return [];
  }

  private mapItemToGrant(
    item: unknown,
    mapping: ApiMappingConfig | undefined,
    source: SourceEntity,
  ): ScrapedGrant | null {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const record = item as Record<string, unknown>;
    const title = this.pickField(record, mapping?.title, ['title', 'name', 'grantTitle']);
    const description = this.pickField(record, mapping?.description, ['description', 'summary', 'details']);

    if (!title || !description) {
      return null;
    }

    const amountValue = this.pickField(record, mapping?.amount, ['amount', 'budget', 'value']);
    const deadlineValue = this.pickField(record, mapping?.deadline, ['deadline', 'dueDate', 'closeDate']);
    const urlValue = this.pickField(record, mapping?.url, ['url', 'link', 'href']);

    return {
      title: String(title).trim(),
      description: String(description).trim(),
      amount: this.parseNumber(amountValue),
      deadline: deadlineValue ? String(deadlineValue) : undefined,
      url: urlValue ? String(urlValue) : source.url,
    };
  }

  private pickField(record: Record<string, unknown>, mappingKey?: string, fallbacks: string[] = []) {
    if (mappingKey) {
      const mapped = this.getByPath(record, mappingKey);
      if (mapped !== undefined && mapped !== null) {
        return mapped;
      }
    }

    for (const key of fallbacks) {
      if (record[key] !== undefined && record[key] !== null) {
        return record[key];
      }
    }

    return undefined;
  }

  private parseNumber(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const normalized = Number(value.replace(/[\s,]/g, ''));
      return Number.isFinite(normalized) ? normalized : undefined;
    }
    return undefined;
  }

  private getByPath(payload: unknown, path: string): unknown {
    if (!payload || typeof payload !== 'object') {
      return undefined;
    }

    const parts = path.split('.').filter(Boolean);
    let current: unknown = payload;

    for (const part of parts) {
      if (!current || typeof current !== 'object') {
        return undefined;
      }
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }
}
