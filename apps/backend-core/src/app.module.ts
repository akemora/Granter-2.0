import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import { validationSchema } from './config/environment.validation';
import { typeOrmConfigFactory } from './database/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { GrantsModule } from './grants/grants.module';
import { SearchModule } from './search/search.module';
import { SourcesModule } from './sources/sources.module';
import { ScraperModule } from './scraper/scraper.module';
import { ProfileModule } from './profile/profile.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { NotificationsModule } from './notifications/notifications.module';
import { QueueModule } from './queue/queue.module';
import { AutomationModule } from './automation/automation.module';
import { HealthModule } from './common/health/health.module';
import { CsrfGuard } from './common/guards/csrf.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: typeOrmConfigFactory,
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 100,
      },
    ]),
    AuthModule,
    GrantsModule,
    SearchModule,
    SourcesModule,
    ScraperModule,
    ProfileModule,
    RecommendationsModule,
    NotificationsModule,
    QueueModule,
    AutomationModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
  ],
})
export class AppModule {}
