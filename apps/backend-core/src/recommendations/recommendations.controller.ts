import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecommendationsService } from './recommendations.service';
import { RecommendationDto } from './dto/recommendation.dto';

@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get()
  async getRecommendations(
    @Request() req: { user: { id: string } },
    @Query('limit') limit?: string,
  ): Promise<RecommendationDto[]> {
    const parsed = Number(limit);
    const safeLimit = Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
    return this.recommendationsService.getRecommendations(req.user.id, Math.min(safeLimit, 50));
  }
}
