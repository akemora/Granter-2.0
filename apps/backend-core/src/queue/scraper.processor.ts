import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SCRAPER_QUEUE, ScraperJobData, ScraperJobResult } from './queue.config';
import { ScraperService } from '../scraper/scraper.service';

@Processor(SCRAPER_QUEUE)
export class ScraperProcessor extends WorkerHost {
  private readonly logger = new Logger(ScraperProcessor.name);

  constructor(private readonly scraperService: ScraperService) {
    super();
  }

  async process(job: Job<ScraperJobData, ScraperJobResult>): Promise<ScraperJobResult> {
    const startTime = Date.now();
    const { sourceId, sourceName } = job.data;

    try {
      const result = await this.scraperService.runSourceById(sourceId);
      const duration = Date.now() - startTime;

      return {
        sourceId,
        sourceName,
        grantsFound: result.grantCount ?? 0,
        grantsSaved: result.saved ?? 0,
        duration,
        success: result.success ?? true,
        error: result.error,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`[Job ${job.id}] Failed for ${sourceName}: ${message}`);

      return {
        sourceId,
        sourceName,
        grantsFound: 0,
        grantsSaved: 0,
        duration,
        success: false,
        error: message,
      };
    }
  }

  @OnWorkerEvent('active')
  onActive(job: Job<ScraperJobData>): void {
    this.logger.log(`[Job ${job.id}] Active - ${job.data.sourceName}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<ScraperJobData, ScraperJobResult>): void {
    this.logger.log(`[Job ${job.id}] Completed`, {
      success: job.returnvalue?.success,
      grantsSaved: job.returnvalue?.grantsSaved,
    });
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<ScraperJobData>, error: Error): void {
    this.logger.error(`[Job ${job?.id}] Failed`, { error: error.message });
  }
}
