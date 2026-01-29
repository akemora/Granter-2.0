import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmartScraperService, ScrapedPage } from './scrapers/smart-scraper.service';
import { GenericScraperService, GenericScrapedPage } from './scrapers/generic-scraper.service';
import { SourceEntity } from '../database/entities/source.entity';
import { GrantEntity } from '../database/entities/grant.entity';
import { ScraperLogEntity } from '../database/entities/scraper-log.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { GrantStatus } from '../common/enums/grant-status.enum';
import { SourceHandler } from './handlers/source-handler.interface';
import { SCRAPER_HANDLERS } from './handlers/handler.tokens';
import { ScrapedGrant, ScraperMethod, SourceHandlerResult } from './scraper.types';

/**
 * Main Scraper Service - Coordinates SmartScraper + GenericScraper
 *
 * Task: S3-D1-1 & S3-D1-2 (Sprint 3, Day 1)
 * Complexity: HIGH - Orchestration logic, fallback chain
 * Assigned to: SONNET (complex orchestration)
 *
 * Features:
 * - Two-tier scraping strategy
 * - SmartScraper: Multi-page (primary)
 * - GenericScraper: Single-page (fallback)
 * - Automatic fallback on timeout/error
 * - Returns best available data
 */

export interface ScraperResult {
  success: boolean;
  pages: ScrapedPage[] | GenericScrapedPage[];
  method: ScraperMethod;
  error?: string;
  grantCount: number;
}

export interface ScrapePersistResult {
  sourceId: string;
  sourceName: string;
  method: ScraperMethod;
  success: boolean;
  saved: number;
  grantCount: number;
  error?: string;
}

export interface ScrapeRunAllResult {
  sourcesProcessed: number;
  totalSaved: number;
  details: ScrapePersistResult[];
}

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(
    private readonly smartScraper: SmartScraperService,
    private readonly genericScraper: GenericScraperService,
    @Inject(SCRAPER_HANDLERS)
    private readonly handlers: SourceHandler[],
    @InjectRepository(SourceEntity)
    private readonly sourcesRepository: Repository<SourceEntity>,
    @InjectRepository(GrantEntity)
    private readonly grantsRepository: Repository<GrantEntity>,
    @InjectRepository(ScraperLogEntity)
    private readonly scraperLogsRepository: Repository<ScraperLogEntity>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async scrapeWithFallback(url: string): Promise<ScraperResult> {
    this.logger.log(`🔄 Starting scraper pipeline for ${url}`);
    let lastErrorMessage: string | undefined;

    // Tier 1: Try SmartScraper (multi-page)
    try {
      this.logger.debug('Tier 1: Attempting SmartScraper...');
      const pages = await this.smartScraper.scrape(url);

      const grantCount = pages.reduce((acc, p) => acc + p.grants.length, 0);
      this.logger.log(`✓ SmartScraper succeeded: ${pages.length} pages, ${grantCount} grants`);

      return {
        success: true,
        pages,
        method: 'smart',
        grantCount,
      };
    } catch (smartError) {
      const message = smartError instanceof Error ? smartError.message : String(smartError);
      lastErrorMessage = message;
      this.logger.warn(`✗ SmartScraper failed: ${message}`);
    }

    // Tier 2: Fallback to GenericScraper (single-page)
    try {
      this.logger.debug('Tier 2: Attempting GenericScraper...');
      const page = await this.genericScraper.scrape(url);

      this.logger.log(`✓ GenericScraper succeeded: ${page.grants.length} grants`);

      return {
        success: true,
        pages: [page],
        method: 'generic',
        grantCount: page.grants.length,
      };
    } catch (genericError) {
      const message = genericError instanceof Error ? genericError.message : String(genericError);
      lastErrorMessage = message;
      this.logger.error(`✗ GenericScraper failed: ${message}`);
    }

    // Tier 3: All scrapers failed
    this.logger.error(`✗ All scraping methods exhausted for ${url}`);

    return {
      success: false,
      pages: [],
      method: 'error',
      error: lastErrorMessage ?? 'Scraping failed - all methods exhausted',
      grantCount: 0,
    };
  }

  /**
   * Extract all grants from scraper result
   * Returns flat array of normalized grants
   */
  getAllGrants(result: ScraperResult): ScrapedGrant[] {
    if (!result.success || result.pages.length === 0) {
      return [];
    }

    const grants: ScrapedGrant[] = [];

    for (const page of result.pages) {
      if ('grants' in page && Array.isArray(page.grants)) {
        grants.push(...page.grants);
      }
    }

    return grants;
  }

  async runAllActiveSources(): Promise<ScrapeRunAllResult> {
    const sources = await this.sourcesRepository.find({ where: { active: true } });
    const details: ScrapePersistResult[] = [];
    let totalSaved = 0;

    for (const source of sources) {
      const outcome = await this.scrapeAndPersist(source);
      totalSaved += outcome.saved;
      details.push(outcome);
    }

    return {
      sourcesProcessed: sources.length,
      totalSaved,
      details,
    };
  }

  async runSourceById(id: string): Promise<ScrapePersistResult> {
    const source = await this.sourcesRepository.findOne({ where: { id } });
    if (!source) {
      return {
        sourceId: id,
        sourceName: 'unknown',
        saved: 0,
        grantCount: 0,
        success: false,
        method: 'error',
        error: 'Source not found',
      };
    }
    return this.scrapeAndPersist(source);
  }

  async getLogsForSource(sourceId: string, limit?: number): Promise<ScraperLogEntity[]> {
    const take = this.normalizeLogLimit(limit);
    return this.scraperLogsRepository.find({
      where: { source: { id: sourceId } },
      order: { timestamp: 'DESC' },
      take,
    });
  }

  private async scrapeAndPersist(source: SourceEntity): Promise<ScrapePersistResult> {
    const handlerResult = await this.scrapeSource(source);
    const savedGrants = await this.persistGrants(source, handlerResult.grants);
    const success = handlerResult.method !== 'error';
    const result: ScraperResult = {
      success,
      pages: [],
      method: handlerResult.method,
      grantCount: handlerResult.grants.length,
      error: handlerResult.error,
    };

    await this.sourcesRepository.update(source.id, { lastRun: new Date() });
    await this.logScrape(source, result, savedGrants.length);
    await this.notifyNewGrants(savedGrants);

    return {
      sourceId: source.id,
      sourceName: source.name,
      method: handlerResult.method,
      success,
      saved: savedGrants.length,
      grantCount: handlerResult.grants.length,
      error: handlerResult.error,
    };
  }

  private async scrapeSource(source: SourceEntity): Promise<SourceHandlerResult> {
    const handler = this.handlers.find((candidate) => candidate.canHandle(source));
    if (!handler) {
      return {
        grants: [],
        method: 'error',
        error: `No handler available for source type ${source.type}`,
      };
    }

    try {
      return await handler.scrape(source);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Handler failed for source ${source.id}: ${message}`);
      return {
        grants: [],
        method: 'error',
        error: message,
      };
    }
  }

  private async persistGrants(source: SourceEntity, grants: ScrapedGrant[]): Promise<GrantEntity[]> {
    const savedGrants: GrantEntity[] = [];
    for (const grant of grants) {
      if (!grant.title || !grant.description) {
        continue;
      }
      const exists = await this.grantExists(source.id, grant.title);
      if (exists) {
        continue;
      }
      const entity = this.buildGrantEntity(source, grant);
      const wasSaved = await this.trySaveGrant(entity, grant.title);
      if (wasSaved) {
        savedGrants.push(entity);
      }
    }
    return savedGrants;
  }

  private buildGrantEntity(source: SourceEntity, grant: ScrapedGrant): GrantEntity {
    return this.grantsRepository.create({
      title: grant.title.trim(),
      description: grant.description.trim(),
      amount: this.normalizeAmount(grant.amount),
      deadline: this.normalizeDeadline(grant.deadline),
      region: source.region ?? 'ES',
      officialUrl: grant.url ?? source.url,
      status: grant.status ?? GrantStatus.OPEN,
      sectors: this.normalizeStringArray(grant.sectors),
      beneficiaries: this.normalizeStringArray(grant.beneficiaries),
      source: { id: source.id },
      sourceId: source.id,
    });
  }

  private async trySaveGrant(entity: GrantEntity, title: string): Promise<boolean> {
    try {
      await this.grantsRepository.save(entity);
      return true;
    } catch (error) {
      this.logger.warn(`Failed to save grant \"${title}\": ${error.message}`);
      return false;
    }
  }

  private async notifyNewGrants(savedGrants: GrantEntity[]): Promise<void> {
    try {
      await this.notificationsService.notifyForNewGrants(savedGrants);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Notification pipeline failed: ${message}`);
    }
  }

  private async logScrape(source: SourceEntity, result: ScraperResult, savedCount: number): Promise<void> {
    const log = this.scraperLogsRepository.create({
      source: { id: source.id },
      status: result.success ? 'success' : 'error',
      result: {
        method: result.method,
        grantCount: result.grantCount,
        savedCount,
        error: result.error,
      },
      timestamp: new Date(),
    });
    await this.scraperLogsRepository.save(log);
  }

  private normalizeLogLimit(limit?: number): number {
    if (!limit || Number.isNaN(limit)) {
      return 10;
    }
    return Math.min(Math.max(limit, 1), 50);
  }

  private normalizeAmount(amount?: number): number | null {
    if (amount === undefined || amount === null) {
      return null;
    }
    return amount > 0 ? amount : null;
  }

  private normalizeDeadline(deadline?: string): Date | null {
    if (!deadline) {
      return null;
    }
    const parsed = new Date(deadline);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private normalizeStringArray(values?: string[]): string[] | null {
    if (!values) {
      return null;
    }
    const normalized = values.map((value) => value.trim()).filter(Boolean);
    return normalized.length > 0 ? normalized : null;
  }

  private async grantExists(sourceId: string, title: string): Promise<boolean> {
    const normalizedTitle = title.trim();
    const existing = await this.grantsRepository.findOne({
      where: { title: normalizedTitle, source: { id: sourceId } },
      relations: ['source'],
    });
    return Boolean(existing);
  }
}
