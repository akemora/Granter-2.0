import { Injectable, Logger } from '@nestjs/common';
import { SmartScraperService, ScrapedPage } from './scrapers/smart-scraper.service';
import { GenericScraperService, GenericScrapedPage } from './scrapers/generic-scraper.service';

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
  method: 'smart' | 'generic' | 'error';
  error?: string;
  grantCount: number;
}

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(
    private readonly smartScraper: SmartScraperService,
    private readonly genericScraper: GenericScraperService
  ) {}

  async scrapeWithFallback(url: string): Promise<ScraperResult> {
    this.logger.log(`🔄 Starting scraper pipeline for ${url}`);

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
      this.logger.warn(`✗ SmartScraper failed: ${smartError.message}`);
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
      this.logger.error(`✗ GenericScraper failed: ${genericError.message}`);
    }

    // Tier 3: All scrapers failed
    this.logger.error(`✗ All scraping methods exhausted for ${url}`);

    return {
      success: false,
      pages: [],
      method: 'error',
      error: 'Scraping failed - all methods exhausted',
      grantCount: 0,
    };
  }

  /**
   * Extract all grants from scraper result
   * Returns flat array of normalized grants
   */
  getAllGrants(result: ScraperResult) {
    if (!result.success || result.pages.length === 0) {
      return [];
    }

    const grants = [];

    for (const page of result.pages) {
      if ('grants' in page && Array.isArray(page.grants)) {
        grants.push(...page.grants);
      }
    }

    return grants;
  }
}
