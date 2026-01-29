import { BullRootModuleOptions } from '@nestjs/bullmq';

export const queueConfig: BullRootModuleOptions = {
  connection: {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    maxRetriesPerRequest: null,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      age: 86400,
      count: 1000,
    },
    removeOnFail: {
      age: 604800,
      count: 5000,
    },
  },
};

export const SCRAPER_QUEUE = 'scraper-queue';

export interface ScraperJobData {
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  sourceType: string;
}

export interface ScraperJobResult {
  sourceId: string;
  sourceName: string;
  grantsFound: number;
  grantsSaved: number;
  duration: number;
  success: boolean;
  error?: string;
}
