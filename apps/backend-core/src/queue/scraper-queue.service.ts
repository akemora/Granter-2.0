import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue, Job } from 'bullmq';
import { Repository } from 'typeorm';
import { SCRAPER_QUEUE, ScraperJobData, ScraperJobResult } from './queue.config';
import { SourceEntity } from '../database/entities/source.entity';

@Injectable()
export class ScraperQueueService {
  private readonly logger = new Logger(ScraperQueueService.name);

  constructor(
    @InjectQueue(SCRAPER_QUEUE)
    private readonly scraperQueue: Queue<ScraperJobData, ScraperJobResult>,
    @InjectRepository(SourceEntity)
    private readonly sourcesRepository: Repository<SourceEntity>,
  ) {}

  async enqueueActiveSources(): Promise<{ queued: number }> {
    const sources = await this.sourcesRepository.find({ where: { active: true } });
    if (sources.length === 0) {
      return { queued: 0 };
    }
    const jobs = await this.addBulkScraperJobs(sources);
    return { queued: jobs.length };
  }

  async enqueueSource(source: SourceEntity): Promise<Job<ScraperJobData, ScraperJobResult>> {
    return this.addScraperJob(source.id, source.name, source.url, source.type);
  }

  async enqueueSourceById(sourceId: string): Promise<Job<ScraperJobData, ScraperJobResult>> {
    const source = await this.sourcesRepository.findOne({ where: { id: sourceId } });
    if (!source) {
      throw new Error('Source not found');
    }
    return this.enqueueSource(source);
  }

  async addScraperJob(
    sourceId: string,
    sourceName: string,
    sourceUrl: string,
    sourceType: string,
  ): Promise<Job<ScraperJobData, ScraperJobResult>> {
    this.logger.log(`Queueing scraper job for ${sourceName}`);
    return this.scraperQueue.add(
      'scrape',
      { sourceId, sourceName, sourceUrl, sourceType },
      { jobId: `scrape-${sourceId}-${Date.now()}` },
    );
  }

  async addBulkScraperJobs(sources: SourceEntity[]): Promise<Job<ScraperJobData, ScraperJobResult>[]> {
    this.logger.log(`Queueing ${sources.length} scraper jobs`);
    return this.scraperQueue.addBulk(
      sources.map((source) => ({
        name: 'scrape',
        data: {
          sourceId: source.id,
          sourceName: source.name,
          sourceUrl: source.url,
          sourceType: source.type,
        },
        opts: { jobId: `scrape-${source.id}-${Date.now()}` },
      })),
    );
  }
}
