import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { XServiceTokenGuard } from '../common/guards/x-service-token.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Scraper Controller
 *
 * Task: S3-D1-1 & S3-D1-2 (Sprint 3, Day 1)
 * Endpoints for scraping grant data from external websites
 */

export class ScrapeRequestDto {
  url: string;
}

export class ScrapeResponseDto {
  success: boolean;
  pages: any[];
  method: 'smart' | 'generic' | 'error';
  error?: string;
  grantCount: number;
}

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  /**
   * POST /scraper/scrape
   *
   * Scrape grants from external URL
   * Protected: Requires JWT token (user authenticated)
   *
   * Request:
   * {
   *   "url": "https://example.com/grants"
   * }
   *
   * Response:
   * {
   *   "success": true,
   *   "pages": [...],
   *   "method": "smart",
   *   "grantCount": 45
   * }
   */
  @Post('scrape')
  @UseGuards(JwtAuthGuard)
  async scrape(@Body() dto: ScrapeRequestDto): Promise<ScrapeResponseDto> {
    if (!dto.url) {
      throw new BadRequestException('URL is required');
    }

    if (!this.isValidUrl(dto.url)) {
      throw new BadRequestException('Invalid URL format');
    }

    const result = await this.scraperService.scrapeWithFallback(dto.url);

    return {
      success: result.success,
      pages: result.pages,
      method: result.method,
      error: result.error,
      grantCount: result.grantCount,
    };
  }

  /**
   * POST /scraper/scrape-async
   *
   * Scrape grants and store in database (async)
   * Protected: Requires X-Service-Token (inter-service)
   *
   * This endpoint is meant to be called from data-service
   * to store scraped data in the database
   */
  @Post('scrape-async')
  @UseGuards(XServiceTokenGuard)
  async scrapeAsync(@Body() dto: ScrapeRequestDto) {
    if (!dto.url) {
      throw new BadRequestException('URL is required');
    }

    const result = await this.scraperService.scrapeWithFallback(dto.url);

    // Store result in queue/cache for async processing
    // TODO: Integrate with queue system (Bull, RabbitMQ, etc.)

    return {
      taskId: `scrape-${Date.now()}`,
      url: dto.url,
      status: 'queued',
      message: 'Scraping task queued for processing',
    };
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
