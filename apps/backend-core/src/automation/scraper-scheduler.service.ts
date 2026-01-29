import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ScraperQueueService } from '../queue/scraper-queue.service';

@Injectable()
export class ScraperSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ScraperSchedulerService.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(private readonly scraperQueue: ScraperQueueService) {}

  onModuleInit(): void {
    if (!this.isEnabled()) return;
    const intervalMs = this.getIntervalMs();
    this.timer = setInterval(() => this.handleScheduledScrape(), intervalMs);
    if (this.shouldRunOnStart()) {
      void this.handleScheduledScrape();
    }
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private async handleScheduledScrape() {
    if (this.running) return;
    this.running = true;
    try {
      const result = await this.scraperQueue.enqueueActiveSources();
      this.logger.log(`Scheduled scrape queued ${result.queued} sources`);
    } finally {
      this.running = false;
    }
  }

  private isEnabled(): boolean {
    return (process.env.SCRAPER_SCHEDULE_ENABLED ?? 'true') === 'true';
  }

  private shouldRunOnStart(): boolean {
    return (process.env.SCRAPER_RUN_ON_START ?? 'true') === 'true';
  }

  private getIntervalMs(): number {
    const minutes = Number(process.env.SCRAPER_INTERVAL_MINUTES ?? 360);
    const safeMinutes = Number.isFinite(minutes) && minutes > 0 ? minutes : 360;
    return safeMinutes * 60 * 1000;
  }
}
