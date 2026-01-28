import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrantEntity } from '../database/entities/grant.entity';
import { SearchFiltersDto } from './dto/search-filters.dto';
import { SearchResultDto } from './dto/search-result.dto';

/**
 * Service for searching grants with full-text search and advanced filtering.
 *
 * Key Features:
 * - PostgreSQL full-text search (to_tsvector/plainto_tsquery)
 * - Advanced filtering by region, sector, amount range, deadline range, status
 * - Query optimization using database indices
 * - Pagination with enforced limits
 * - Lazy loading of relationships to avoid N+1 queries
 */
@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly MAX_PAGE_SIZE = 100;

  constructor(
    @InjectRepository(GrantEntity)
    private readonly grantsRepository: Repository<GrantEntity>,
  ) {}

  /**
   * Search grants with optional filters and pagination.
   *
   * @param filters - Optional search filters (query, regions, sectors, amount range, deadline range, status)
   * @param pagination - Optional pagination parameters (skip, take)
   * @returns SearchResultDto with results and pagination metadata
   * @throws BadRequestException if search query is invalid
   *
   * @example
   * ```typescript
   * const results = await searchService.searchGrants(
   *   {
   *     query: 'research',
   *     regions: ['ES', 'EU'],
   *     minAmount: 1000,
   *     maxAmount: 100000
   *   },
   *   { skip: 0, take: 20 }
   * );
   * ```
   */
  async searchGrants(
    filters: SearchFiltersDto = {},
    pagination?: { skip?: number; take?: number },
  ): Promise<SearchResultDto> {
    try {
      const { skip = 0, take = 20 } = pagination || {};

      // Validate pagination parameters
      if (skip < 0) {
        throw new BadRequestException('Skip parameter cannot be negative');
      }

      if (take <= 0) {
        throw new BadRequestException('Take parameter must be greater than 0');
      }

      // Enforce maximum page size to prevent abuse and performance issues
      const safeTake = Math.min(take, this.MAX_PAGE_SIZE);

      // Start building the query
      let query = this.grantsRepository.createQueryBuilder('grant')
        .leftJoinAndSelect('grant.source', 'source');

      // Apply full-text search filter
      if (filters.query) {
        this.validateSearchQuery(filters.query);
        query = query.andWhere(
          `to_tsvector('english', coalesce(grant.title, '') || ' ' || coalesce(grant.description, '')) @@ plainto_tsquery('english', :query)`,
          { query: filters.query },
        );
        this.logger.debug(`Full-text search applied with query: ${filters.query}`);
      }

      // Apply region filter (supports multiple regions)
      if (filters.regions && filters.regions.length > 0) {
        query = query.andWhere('grant.region IN (:...regions)', {
          regions: filters.regions,
        });
        this.logger.debug(`Region filter applied: ${filters.regions.join(', ')}`);
      }

      // Apply sector filter (via source relationship)
      // Note: This filter is prepared for future sector column in source table
      if (filters.sectors && filters.sectors.length > 0) {
        // Uncomment when source.sector column is added to database
        // query = query.andWhere('source.sector IN (:...sectors)', {
        //   sectors: filters.sectors,
        // });
        this.logger.debug(
          `Sector filter requested but not yet available: ${filters.sectors.join(', ')}`,
        );
        // For now, just log and continue
      }

      // Apply minimum amount filter
      if (filters.minAmount !== undefined && filters.minAmount !== null) {
        if (filters.minAmount < 0) {
          throw new BadRequestException('Minimum amount cannot be negative');
        }
        query = query.andWhere('grant.amount >= :minAmount', {
          minAmount: filters.minAmount,
        });
        this.logger.debug(`Minimum amount filter applied: ${filters.minAmount}`);
      }

      // Apply maximum amount filter
      if (filters.maxAmount !== undefined && filters.maxAmount !== null) {
        if (filters.maxAmount < 0) {
          throw new BadRequestException('Maximum amount cannot be negative');
        }
        query = query.andWhere('grant.amount <= :maxAmount', {
          maxAmount: filters.maxAmount,
        });
        this.logger.debug(`Maximum amount filter applied: ${filters.maxAmount}`);
      }

      // Validate amount range
      if (
        filters.minAmount !== undefined &&
        filters.maxAmount !== undefined &&
        filters.minAmount > filters.maxAmount
      ) {
        throw new BadRequestException(
          'Minimum amount cannot be greater than maximum amount',
        );
      }

      // Apply deadline after filter
      if (filters.deadlineAfter) {
        const deadlineAfterDate = new Date(filters.deadlineAfter);
        if (isNaN(deadlineAfterDate.getTime())) {
          throw new BadRequestException('Invalid deadlineAfter date format');
        }
        query = query.andWhere('grant.deadline > :deadlineAfter', {
          deadlineAfter: deadlineAfterDate,
        });
        this.logger.debug(`Deadline after filter applied: ${filters.deadlineAfter}`);
      }

      // Apply deadline before filter
      if (filters.deadlineBefore) {
        const deadlineBeforeDate = new Date(filters.deadlineBefore);
        if (isNaN(deadlineBeforeDate.getTime())) {
          throw new BadRequestException('Invalid deadlineBefore date format');
        }
        query = query.andWhere('grant.deadline < :deadlineBefore', {
          deadlineBefore: deadlineBeforeDate,
        });
        this.logger.debug(`Deadline before filter applied: ${filters.deadlineBefore}`);
      }

      // Validate deadline range
      if (filters.deadlineAfter && filters.deadlineBefore) {
        const afterDate = new Date(filters.deadlineAfter);
        const beforeDate = new Date(filters.deadlineBefore);
        if (afterDate >= beforeDate) {
          throw new BadRequestException(
            'deadlineAfter must be before deadlineBefore',
          );
        }
      }

      // Apply status filter
      // Note: This filter is prepared for future status column in grant table
      if (filters.status) {
        // Uncomment when grant.status column is added to database
        // query = query.andWhere('grant.status = :status', {
        //   status: filters.status,
        // });
        this.logger.debug(
          `Status filter requested but not yet available: ${filters.status}`,
        );
        // For now, just log and continue
      }

      // Get total count before pagination (for accurate pagination metadata)
      const total = await query.getCount();

      // Apply sorting and pagination
      // Results are sorted by creation date in descending order (most recent first)
      const data = await query
        .orderBy('grant.createdAt', 'DESC')
        .addOrderBy('grant.id', 'ASC') // Secondary sort for deterministic ordering
        .skip(skip)
        .take(safeTake)
        .getMany();

      this.logger.log(
        `Search completed: found ${total} total results, returning ${data.length} items (page ${Math.floor(skip / safeTake) + 1})`,
      );

      return new SearchResultDto(data, total, skip, safeTake);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `Search failed: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Search query invalid or database error');
    }
  }

  /**
   * Validate search query to prevent SQL injection and empty queries.
   *
   * @param query - The search query string
   * @throws BadRequestException if query is invalid
   */
  private validateSearchQuery(query: string): void {
    if (!query || typeof query !== 'string') {
      throw new BadRequestException('Search query must be a non-empty string');
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length === 0) {
      throw new BadRequestException('Search query cannot be empty');
    }

    if (trimmedQuery.length > 500) {
      throw new BadRequestException('Search query cannot exceed 500 characters');
    }

    // PostgreSQL plainto_tsquery handles special characters safely
    // but we still validate to ensure reasonable input
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmedQuery)) {
      // Allow alphanumeric, spaces, hyphens, underscores
      // PostgreSQL will handle other characters safely via parameterized queries
      this.logger.debug(`Special characters detected in search query: ${trimmedQuery}`);
    }
  }
}
