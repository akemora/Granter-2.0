import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { SmartScraperService } from './scrapers/smart-scraper.service';
import { GenericScraperService } from './scrapers/generic-scraper.service';
import { SourceEntity } from '../database/entities/source.entity';
import { GrantEntity } from '../database/entities/grant.entity';
import { ScraperLogEntity } from '../database/entities/scraper-log.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { QueueModule } from '../queue/queue.module';
import { HtmlHandler } from './handlers/html.handler';
import { ApiHandler } from './handlers/api.handler';
import { RssHandler } from './handlers/rss.handler';
import { PdfHandler } from './handlers/pdf.handler';
import { SCRAPER_HANDLERS } from './handlers/handler.tokens';

@Module({
  imports: [
    TypeOrmModule.forFeature([SourceEntity, GrantEntity, ScraperLogEntity]),
    NotificationsModule,
    forwardRef(() => QueueModule),
  ],
  providers: [
    ScraperService,
    SmartScraperService,
    GenericScraperService,
    HtmlHandler,
    ApiHandler,
    RssHandler,
    PdfHandler,
    {
      provide: SCRAPER_HANDLERS,
      useFactory: (html: HtmlHandler, api: ApiHandler, rss: RssHandler, pdf: PdfHandler) => [html, api, rss, pdf],
      inject: [HtmlHandler, ApiHandler, RssHandler, PdfHandler],
    },
  ],
  controllers: [ScraperController],
  exports: [ScraperService],
})
export class ScraperModule {}
