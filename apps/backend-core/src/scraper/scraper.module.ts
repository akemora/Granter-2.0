import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { SmartScraperService } from './scrapers/smart-scraper.service';
import { GenericScraperService } from './scrapers/generic-scraper.service';

@Module({
  imports: [],
  providers: [ScraperService, SmartScraperService, GenericScraperService],
  controllers: [ScraperController],
  exports: [ScraperService],
})
export class ScraperModule {}
