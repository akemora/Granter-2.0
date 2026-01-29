import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchFiltersDto } from './dto/search-filters.dto';
import { SearchResultDto } from './dto/search-result.dto';
import { SearchQueryDto } from './dto/search-query.dto';

/**
 * Controller for search endpoints.
 *
 * Provides a full-text search and advanced filtering API for grants.
 * All search operations support optional filters and pagination.
 */
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * Search grants with optional filters and pagination.
   *
   * @param filters - Optional search filters (query, regions, sectors, amount range, deadline range, status)
   * @param pagination - Optional pagination parameters (skip, take)
   * @returns SearchResultDto with results and pagination metadata
   *
   * @example
   * GET /search?query=research&regions=ES&regions=EU&minAmount=1000&skip=0&take=20
   *
   * Response:
   * ```json
   * {
   *   "data": [...grants],
   *   "total": 150,
   *   "skip": 0,
   *   "take": 20,
   *   "currentPage": 1,
   *   "totalPages": 8
   * }
   * ```
   */
  @Get()
  async search(@Query() query: SearchQueryDto): Promise<SearchResultDto> {
    const { skip, take, ...filters } = query;
    return this.searchService.searchGrants(filters as SearchFiltersDto, { skip, take });
  }
}
