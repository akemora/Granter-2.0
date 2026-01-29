import { Injectable, Logger } from '@nestjs/common';
import { SourceEntity } from '../../database/entities/source.entity';
import { SourceType } from '../../common/enums/source-type.enum';
import { SmartScraperService, ScrapedPage } from '../scrapers/smart-scraper.service';
import { GenericScraperService, GenericScrapedPage } from '../scrapers/generic-scraper.service';
import { SourceHandler } from './source-handler.interface';
import { ScrapedGrant, ScraperMethod, SourceHandlerResult } from '../scraper.types';

@Injectable()
export class HtmlHandler implements SourceHandler {
  private readonly logger = new Logger(HtmlHandler.name);
  private readonly dataServiceUrl = process.env.DATA_SERVICE_URL ?? 'http://localhost:8000';

  constructor(
    private readonly smartScraper: SmartScraperService,
    private readonly genericScraper: GenericScraperService,
  ) {}

  canHandle(source: SourceEntity): boolean {
    return source.type === SourceType.HTML;
  }

  async scrape(source: SourceEntity): Promise<SourceHandlerResult> {
    let method: ScraperMethod = 'error';
    let lastError: string | undefined;
    let pages: Array<ScrapedPage | GenericScrapedPage> = [];

    try {
      const smartPages = await this.smartScraper.scrape(source.url);
      pages = smartPages;
      method = 'smart';
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      this.logger.warn(`SmartScraper failed for ${source.url}: ${lastError}`);
    }

    if (method === 'error') {
      try {
        const page = await this.genericScraper.scrape(source.url);
        pages = [page];
        method = 'generic';
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        this.logger.error(`GenericScraper failed for ${source.url}: ${lastError}`);
      }
    }

    if (method === 'error') {
      return {
        grants: [],
        method: 'error',
        error: lastError ?? 'Scraping failed - all methods exhausted',
      };
    }

    let grants = this.extractGrants(pages);
    if (this.isIAEnabled(source)) {
      grants = await this.enhanceWithIA(grants, pages, source);
    }

    return { grants, method };
  }

  private extractGrants(pages: Array<ScrapedPage | GenericScrapedPage>): ScrapedGrant[] {
    const grants: ScrapedGrant[] = [];
    for (const page of pages) {
      if ('grants' in page && Array.isArray(page.grants)) {
        grants.push(...page.grants);
      }
    }
    return grants;
  }

  private isIAEnabled(source: SourceEntity): boolean {
    const metadata = source.metadata ?? {};
    const iaConfig = metadata['ia'];
    if (typeof metadata['iaExtraction'] === 'boolean') {
      return metadata['iaExtraction'];
    }
    if (iaConfig && typeof iaConfig === 'object' && 'enabled' in iaConfig) {
      return Boolean((iaConfig as { enabled?: boolean }).enabled);
    }
    return false;
  }

  private async enhanceWithIA(
    grants: ScrapedGrant[],
    pages: Array<ScrapedPage | GenericScrapedPage>,
    source: SourceEntity,
  ): Promise<ScrapedGrant[]> {
    const htmlCandidate = this.getFirstHtmlCandidate(pages);
    if (!htmlCandidate) {
      return grants;
    }

    const extracted = await this.requestIA(htmlCandidate.html, htmlCandidate.url, source.name);
    if (!extracted) {
      return grants;
    }

    return this.mergeIAResult(grants, extracted);
  }

  private getFirstHtmlCandidate(pages: Array<ScrapedPage | GenericScrapedPage>): { html: string; url: string } | null {
    for (const page of pages) {
      if ('content' in page && typeof page.content === 'string' && page.content.length > 0) {
        return { html: page.content, url: page.url };
      }
    }
    return null;
  }

  private async requestIA(html: string, url: string, sourceName: string): Promise<ScrapedGrant | null> {
    const trimmedHtml = html.slice(0, 1_000_000);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (process.env.SERVICE_TOKEN) {
      headers['X-Service-Token'] = process.env.SERVICE_TOKEN;
    }

    try {
      const response = await fetch(`${this.dataServiceUrl}/api/ia/extract`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ html: trimmedHtml, url, source: sourceName }),
      });

      if (!response.ok) {
        const body = await response.text();
        this.logger.warn(`IA extraction failed: ${response.status} ${body}`);
        return null;
      }

      const payload = (await response.json()) as {
        success?: boolean;
        data?: {
          title: string;
          description: string;
          amount?: number | null;
          deadline?: string | null;
          url?: string;
          source?: string;
        };
      };

      if (!payload?.data?.title || !payload?.data?.description) {
        return null;
      }

      return {
        title: payload.data.title,
        description: payload.data.description,
        amount: payload.data.amount ?? undefined,
        deadline: payload.data.deadline ?? undefined,
        url: payload.data.url ?? url,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`IA extraction request failed: ${message}`);
      return null;
    }
  }

  private mergeIAResult(grants: ScrapedGrant[], extracted: ScrapedGrant): ScrapedGrant[] {
    const existing = grants.find((grant) => grant.title.trim().toLowerCase() === extracted.title.trim().toLowerCase());

    if (!existing) {
      return [...grants, extracted];
    }

    const merged: ScrapedGrant = {
      ...existing,
      description: existing.description || extracted.description,
      amount: existing.amount ?? extracted.amount,
      deadline: existing.deadline ?? extracted.deadline,
      url: existing.url ?? extracted.url,
    };

    return grants.map((grant) => (grant === existing ? merged : grant));
  }
}
