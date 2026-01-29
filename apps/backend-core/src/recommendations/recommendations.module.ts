import { Module } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { SearchModule } from '../search/search.module';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [SearchModule, ProfileModule],
  providers: [RecommendationsService],
  controllers: [RecommendationsController],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
