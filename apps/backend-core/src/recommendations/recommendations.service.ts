import { Injectable } from '@nestjs/common';
import { SearchService } from '../search/search.service';
import { ProfileService } from '../profile/profile.service';
import { UserProfileEntity } from '../database/entities/user-profile.entity';
import { GrantEntity } from '../database/entities/grant.entity';
import { SearchFiltersDto } from '../search/dto/search-filters.dto';
import { RecommendationDto } from './dto/recommendation.dto';

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly searchService: SearchService,
    private readonly profileService: ProfileService,
  ) {}

  async getRecommendations(userId: string, limit: number = 10): Promise<RecommendationDto[]> {
    const profile = await this.profileService.getProfile(userId);
    const filters = this.buildFilters(profile);
    const take = Math.max(limit * 3, limit);
    const results = await this.searchService.searchGrants(filters, { skip: 0, take });
    const ranked = this.rankGrants(results.data, profile);
    return ranked.slice(0, limit);
  }

  rankGrants(grants: GrantEntity[], profile: UserProfileEntity): RecommendationDto[] {
    const keywords = this.normalizeKeywords(profile.keywords);
    const filtered = this.filterByProfile(grants, profile);
    const scored = filtered.map((grant) => this.scoreGrant(grant, profile, keywords));
    return scored.sort((a, b) => b.score - a.score);
  }

  private buildFilters(profile: UserProfileEntity): SearchFiltersDto {
    const query = profile.keywords.length > 0 ? profile.keywords.join(' ') : undefined;
    return {
      query,
      regions: profile.regions.length > 0 ? profile.regions : undefined,
      minAmount: profile.minAmount ?? undefined,
      maxAmount: profile.maxAmount ?? undefined,
    };
  }

  private filterByProfile(grants: GrantEntity[], profile: UserProfileEntity): GrantEntity[] {
    return grants.filter((grant) => this.matchesRegion(grant, profile) && this.matchesAmount(grant, profile));
  }

  private matchesRegion(grant: GrantEntity, profile: UserProfileEntity): boolean {
    if (profile.regions.length === 0) return true;
    return profile.regions.includes(grant.region);
  }

  private matchesAmount(grant: GrantEntity, profile: UserProfileEntity): boolean {
    if (grant.amount == null) return profile.minAmount == null && profile.maxAmount == null;
    if (profile.minAmount != null && Number(grant.amount) < Number(profile.minAmount)) return false;
    if (profile.maxAmount != null && Number(grant.amount) > Number(profile.maxAmount)) return false;
    return true;
  }

  private scoreGrant(grant: GrantEntity, profile: UserProfileEntity, keywords: string[]): RecommendationDto {
    const text = `${grant.title} ${grant.description}`.toLowerCase();
    const matched = keywords.filter((keyword) => text.includes(keyword));
    const regionBoost = this.matchesRegion(grant, profile) ? 5 : 0;
    const amountBoost = this.matchesAmount(grant, profile) ? 5 : 0;
    const base = matched.length > 0 ? matched.length * 10 : 1;
    return { grant, score: base + regionBoost + amountBoost, matchedKeywords: matched };
  }

  private normalizeKeywords(keywords: string[]): string[] {
    return keywords.map((keyword) => keyword.trim().toLowerCase()).filter((keyword) => keyword.length > 0);
  }
}
