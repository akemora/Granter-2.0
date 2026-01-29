import { RecommendationsController } from '../recommendations.controller';
import { RecommendationsService } from '../recommendations.service';
import { RecommendationDto } from '../dto/recommendation.dto';

describe('RecommendationsController', () => {
  it('returns recommendations with capped limit', async () => {
    const service = {
      getRecommendations: jest.fn().mockResolvedValue([
        {
          grant: { id: 'g1' } as RecommendationDto['grant'],
          score: 1,
          matchedKeywords: [],
        },
      ]),
    } as unknown as RecommendationsService;

    const controller = new RecommendationsController(service);
    const result = await controller.getRecommendations({ user: { id: 'user-1' } }, '99');

    expect(service.getRecommendations).toHaveBeenCalledWith('user-1', 50);
    expect(result).toHaveLength(1);
  });

  it('uses default limit when invalid', async () => {
    const service = {
      getRecommendations: jest.fn().mockResolvedValue([]),
    } as unknown as RecommendationsService;

    const controller = new RecommendationsController(service);
    await controller.getRecommendations({ user: { id: 'user-1' } }, 'oops');

    expect(service.getRecommendations).toHaveBeenCalledWith('user-1', 10);
  });
});
