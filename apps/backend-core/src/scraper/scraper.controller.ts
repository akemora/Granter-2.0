import { Controller, Post, Body, UseGuards, BadRequestException, Param, Get, Query } from '@nestjs/common';
import { ScraperService, ScraperResult, ScrapePersistResult, ScrapeRunAllResult } from './scraper.service';
import { XServiceTokenGuard } from '../common/guards/x-service-token.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ScraperQueueService } from '../queue/scraper-queue.service';
import { ScrapeRequestDto } from './dto/scrape-request.dto';
import { ScrapeAsyncRequestDto } from './dto/scrape-async-request.dto';
import { ScrapeLogsQueryDto } from './dto/scrape-logs-query.dto';
import { ScraperLogEntity } from '../database/entities/scraper-log.entity';

/**
 * Scraper Controller
 *
 * Task: S3-D1-1 & S3-D1-2 (Sprint 3, Day 1)
 * Endpoints for scraping grant data from external websites
 */

export class ScrapeResponseDto {
  success: boolean;
  pages: ScraperResult['pages'];
  method: ScraperResult['method'];
  error?: string;
  grantCount: number;
}

export interface ScrapeAsyncResponseDto {
  taskId: string;
  sourceId: string;
  status: 'queued';
  message: string;
}

@Controller('scraper')
export class ScraperController {
  constructor(
    private readonly scraperService: ScraperService,
    private readonly scraperQueue: ScraperQueueService,
  ) {}

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
  async scrapeAsync(@Body() dto: ScrapeAsyncRequestDto): Promise<ScrapeAsyncResponseDto> {
    if (!dto.sourceId) {
      throw new BadRequestException('sourceId is required');
    }

    try {
      const result = await this.scraperQueue.enqueueSourceById(dto.sourceId);
      return {
        taskId: result.id,
        sourceId: dto.sourceId,
        status: 'queued',
        message: 'Scraping task queued for processing',
      } as ScrapeAsyncResponseDto;
    } catch (error) {
      throw new BadRequestException('Source not found');
    }
  }

  /**
   * POST /scraper/run
   *
   * Scrape all active sources and persist grants
   * Protected: Requires JWT token (user authenticated)
   */
  @Post('run')
  @UseGuards(JwtAuthGuard)
  async runAll(): Promise<ScrapeRunAllResult> {
    return this.scraperService.runAllActiveSources();
  }

  /**
   * POST /scraper/source/:id
   *
   * Scrape a single source and persist grants
   * Protected: Requires JWT token (user authenticated)
   */
  @Post('source/:id')
  @UseGuards(JwtAuthGuard)
  async runSource(@Param('id') id: string): Promise<ScrapePersistResult> {
    return this.scraperService.runSourceById(id);
  }

  /**
   * GET /scraper/source/:id/logs
   *
   * Retrieve recent scrape logs for a source
   * Protected: Requires JWT token (user authenticated)
   */
  @Get('source/:id/logs')
  @UseGuards(JwtAuthGuard)
  async getSourceLogs(@Param('id') id: string, @Query() query: ScrapeLogsQueryDto): Promise<ScraperLogEntity[]> {
    return this.scraperService.getLogsForSource(id, query.limit);
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
