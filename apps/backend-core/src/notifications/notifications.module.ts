import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { GrantNotificationEntity } from '../database/entities/grant-notification.entity';
import { RecommendationsModule } from '../recommendations/recommendations.module';
import { UserProfileEntity } from '../database/entities/user-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GrantNotificationEntity, UserProfileEntity]), RecommendationsModule],
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
