import { GrantEntity } from '../../database/entities/grant.entity';

export interface RecommendationDto {
  grant: GrantEntity;
  score: number;
  matchedKeywords: string[];
}
