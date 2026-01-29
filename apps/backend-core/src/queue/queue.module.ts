import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { queueConfig, SCRAPER_QUEUE } from './queue.config';
import { ScraperQueueService } from './scraper-queue.service';
import { ScraperProcessor } from './scraper.processor';
import { SourceEntity } from '../database/entities/source.entity';
import { ScraperModule } from '../scraper/scraper.module';

@Module({
  imports: [
    BullModule.forRoot(queueConfig),
    BullModule.registerQueue({ name: SCRAPER_QUEUE }),
    TypeOrmModule.forFeature([SourceEntity]),
    forwardRef(() => ScraperModule),
  ],
  providers: [ScraperQueueService, ScraperProcessor],
  exports: [ScraperQueueService],
})
export class QueueModule {}
