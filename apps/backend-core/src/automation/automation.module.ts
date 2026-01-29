import { Module } from '@nestjs/common';
import { QueueModule } from '../queue/queue.module';
import { ScraperSchedulerService } from './scraper-scheduler.service';

@Module({
  imports: [QueueModule],
  providers: [ScraperSchedulerService],
})
export class AutomationModule {}
