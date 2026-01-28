import { Injectable, Logger, BadRequestException } from '@nestjs/common';

/**
 * GenericScraper Service - Simple single-page scraper (fallback)
 *
 * Task: S3-D1-2 (Sprint 3, Day 1)
 * Complexity: MEDIUM - Basic HTML parsing
 * Assigned to: HAIKU (simpler task, fallback logic)
 *
 * Features:
 * - Single page scraping
 * - Simple HTML parsing
 * - No multi-page navigation
 * - Fast and reliable
 * - Used as fallback when SmartScraper fails
 */

export interface GenericScrapedPage {
  url: string;
  title: string;
  grants: GenericScrapedGrant[];
}

export interface GenericScrapedGrant {
  title: string;
  description: string;
  amount?: number;
  deadline?: string;
}

@Injectable()
export class GenericScraperService {
  private readonly logger = new Logger(GenericScraperService.name);

  async scrape(url: string): Promise<GenericScrapedPage> {
    this.logger.log(`Starting GenericScraper for ${url}`);

    if (!this.isValidUrl(url)) {
      throw new BadRequestException('Invalid URL');
    }

    try {
      const html = await this.fetchHtml(url);
      const title = this.extractTitle(html);
      const grants = this.extractGrants(html);

      this.logger.log(`✓ Generic scraping complete: ${grants.length} grants found`);

      return { url, title, grants };
    } catch (error) {
      this.logger.error(`✗ Generic scraping failed: ${error.message}`);
      throw error;
    }
  }

  private async fetchHtml(url: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private extractTitle(html: string): string {
    // Try title tag
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (titleMatch?.[1]) {
      return titleMatch[1].trim();
    }

    // Try h1
    const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
    if (h1Match?.[1]) {
      return h1Match[1].trim();
    }

    return 'Page';
  }

  private extractGrants(html: string): GenericScrapedGrant[] {
    const grants: GenericScrapedGrant[] = [];

    // Remove script and style tags
    const cleanHtml = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // Look for h2/h3 headers (potential grant titles)
    const headerPattern = /<h[23][^>]*>([^<]+)<\/h[23]>/gi;
    let headerMatch;

    while ((headerMatch = headerPattern.exec(cleanHtml)) !== null) {
      const title = headerMatch[1].trim();

      if (title.length > 5 && title.length < 200) {
        // Find following p tag as description
        const afterHeader = cleanHtml.substring(headerMatch.index + headerMatch[0].length);
        const pMatch = afterHeader.match(/<p[^>]*>([^<]+)<\/p>/);

        const description = pMatch ? pMatch[1].trim() : title;

        if (description.length > 10) {
          const grant: GenericScrapedGrant = {
            title,
            description,
          };

          // Try to extract amount
          const amountMatch = afterHeader.match(/[€$]\s*(\d{1,3}(?:[,\.]\d{3})*)/);
          if (amountMatch) {
            grant.amount = parseInt(
              amountMatch[1].replace(/[,\.]/g, ''),
              10
            );
          }

          // Try to extract deadline
          const dateMatch = afterHeader.match(
            /(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/
          );
          if (dateMatch) {
            grant.deadline = this.normalizeDate(dateMatch[1]);
          }

          grants.push(grant);
        }
      }
    }

    return grants.slice(0, 20); // Max 20 grants
  }

  private normalizeDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return dateStr;
      }
      return date.toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
