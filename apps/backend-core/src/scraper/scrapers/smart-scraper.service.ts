import { Injectable, Logger, BadRequestException, ServiceUnavailableException } from '@nestjs/common';

/**
 * SmartScraper Service - Multi-page web scraper with intelligent navigation
 *
 * Task: S3-D1-1 (Sprint 3, Day 1)
 * Complexity: HIGH - Multi-page navigation, 2 levels depth, 5 page max
 * Assigned to: SONNET (complex logic)
 *
 * Features:
 * - Crawls multiple pages automatically
 * - Follows links intelligently
 * - Extracts structured data
 * - Timeout protection (30s per page)
 * - Fallback on failure
 */

export interface ScraperConfig {
  startUrl: string;
  maxPages: number;
  maxDepth: number;
  timeout: number;
}

export interface ScrapedPage {
  url: string;
  title: string;
  content: string;
  grants: ScrapedGrant[];
  links: string[];
  depth: number;
}

export interface ScrapedGrant {
  title: string;
  description: string;
  amount?: number;
  deadline?: string;
  url: string;
}

@Injectable()
export class SmartScraperService {
  private readonly logger = new Logger(SmartScraperService.name);

  private readonly defaultConfig: ScraperConfig = {
    startUrl: '',
    maxPages: 5,
    maxDepth: 2,
    timeout: 30000, // 30 seconds per page
  };

  async scrape(startUrl: string): Promise<ScrapedPage[]> {
    this.logger.log(`Starting SmartScraper for ${startUrl}`);

    if (!this.isValidUrl(startUrl)) {
      throw new BadRequestException('Invalid start URL');
    }

    const config = {
      ...this.defaultConfig,
      startUrl,
    };

    const visited = new Set<string>();
    const pages: ScrapedPage[] = [];

    try {
      await this.crawlPage(startUrl, 0, config, visited, pages);
      this.logger.log(`✓ Scraping complete: ${pages.length} pages crawled`);
      return pages;
    } catch (error) {
      this.logger.error(`✗ Scraping failed: ${error.message}`);
      throw new ServiceUnavailableException('Scraping failed');
    }
  }

  private async crawlPage(
    url: string,
    depth: number,
    config: ScraperConfig,
    visited: Set<string>,
    results: ScrapedPage[]
  ): Promise<void> {
    // Check termination conditions
    if (visited.has(url)) {
      this.logger.debug(`Skipping already visited: ${url}`);
      return;
    }

    if (results.length >= config.maxPages) {
      this.logger.debug(`Max pages (${config.maxPages}) reached`);
      return;
    }

    if (depth >= config.maxDepth) {
      this.logger.debug(`Max depth (${config.maxDepth}) reached`);
      return;
    }

    visited.add(url);

    try {
      this.logger.debug(`Crawling: ${url} (depth: ${depth})`);

      const page = await this.fetchPage(url, config.timeout);
      results.push(page);

      // Extract and follow links from this page
      const internalLinks = this.extractLinks(url, page.links);

      for (const link of internalLinks) {
        if (results.length >= config.maxPages) break;
        await this.crawlPage(link, depth + 1, config, visited, results);
      }
    } catch (error) {
      this.logger.warn(`Failed to crawl ${url}: ${error.message}`);
      // Continue with next page instead of failing entire scrape
    }
  }

  private async fetchPage(url: string, timeout: number): Promise<ScrapedPage> {
    this.logger.debug(`Fetching: ${url}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

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

      const html = await response.text();

      const title = this.extractTitle(html);
      const grants = this.extractGrants(html, url);
      const links = this.extractAllLinks(html, url);

      return {
        url,
        title,
        content: html,
        grants,
        links,
        depth: 0,
      };
    } catch (error) {
      throw new Error(`Fetch failed: ${error.message}`);
    }
  }

  private extractTitle(html: string): string {
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim();
    }

    const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
    if (h1Match && h1Match[1]) {
      return h1Match[1].trim();
    }

    return 'Untitled Page';
  }

  private extractGrants(html: string, pageUrl: string): ScrapedGrant[] {
    const grants: ScrapedGrant[] = [];

    // Look for common grant patterns
    const grantPatterns = [
      // Pattern 1: Title in h2/h3 with description in p
      /<h[23][^>]*>([^<]+)<\/h[23]>[\s\S]*?<p[^>]*>([^<]+)<\/p>/gi,
      // Pattern 2: Strong/bold title with description
      /<strong>([^<]+)<\/strong>[\s\S]*?<p[^>]*>([^<]+)<\/p>/gi,
    ];

    for (const pattern of grantPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const title = match[1]?.trim();
        const description = match[2]?.trim();

        if (title && description && title.length > 5) {
          grants.push({
            title,
            description,
            url: pageUrl,
          });
        }
      }
    }

    // Extract amounts (€ or $ patterns)
    const amountPattern = /[€$]\s*(\d{1,3}(?:[,\.]\d{3})*)/g;
    for (const grant of grants) {
      const amountMatch = amountPattern.exec(html);
      if (amountMatch) {
        grant.amount = parseInt(amountMatch[1].replace(/[,\.]/g, ''), 10);
      }
    }

    // Extract deadlines (ISO 8601 or common formats)
    const deadlinePattern =
      /(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4})/g;
    const deadlineMatch = deadlinePattern.exec(html);
    if (deadlineMatch) {
      grants.forEach((grant) => {
        grant.deadline = this.normalizeDate(deadlineMatch[1]);
      });
    }

    return grants.slice(0, 10); // Max 10 grants per page
  }

  private extractAllLinks(html: string, baseUrl: string): string[] {
    const links: string[] = [];
    const linkPattern = /<a[^>]*href=["']([^"']+)["'][^>]*>/gi;
    let match;

    while ((match = linkPattern.exec(html)) !== null) {
      const href = match[1];

      // Convert relative URLs to absolute
      const absoluteUrl = this.resolveUrl(baseUrl, href);

      if (
        absoluteUrl &&
        this.isInternalLink(absoluteUrl, baseUrl) &&
        !links.includes(absoluteUrl)
      ) {
        links.push(absoluteUrl);
      }
    }

    return links.slice(0, 20); // Max 20 links per page
  }

  private extractLinks(baseUrl: string, allLinks: string[]): string[] {
    return allLinks.filter((link) => this.isInternalLink(link, baseUrl));
  }

  private resolveUrl(baseUrl: string, href: string): string | null {
    try {
      if (href.startsWith('http')) {
        return href;
      }

      if (href.startsWith('/')) {
        const base = new URL(baseUrl);
        return `${base.protocol}//${base.host}${href}`;
      }

      if (href.startsWith('#') || href.startsWith('javascript:')) {
        return null;
      }

      const base = new URL(baseUrl);
      return new URL(href, base).toString();
    } catch {
      return null;
    }
  }

  private isInternalLink(url: string, baseUrl: string): boolean {
    try {
      const urlObj = new URL(url);
      const baseObj = new URL(baseUrl);

      // Only follow same domain
      return (
        urlObj.hostname === baseObj.hostname &&
        !url.includes('.pdf') &&
        !url.includes('logout')
      );
    } catch {
      return false;
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
}
