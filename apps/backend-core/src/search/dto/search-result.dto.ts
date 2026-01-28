import { GrantEntity } from '../../database/entities/grant.entity';

/**
 * Data Transfer Object for search results with pagination information.
 * Contains the data array and computed pagination metadata.
 */
export class SearchResultDto {
  /**
   * Array of grant results for the current page
   */
  data: GrantEntity[];

  /**
   * Total number of grants matching the search criteria (across all pages)
   */
  total: number;

  /**
   * Number of items skipped from the beginning
   */
  skip: number;

  /**
   * Number of items returned (page size)
   */
  take: number;

  /**
   * Current page number (1-indexed)
   */
  currentPage: number;

  /**
   * Total number of pages available
   */
  totalPages: number;

  constructor(
    data: GrantEntity[],
    total: number,
    skip: number,
    take: number,
  ) {
    this.data = data;
    this.total = total;
    this.skip = skip;
    this.take = take;
    this.currentPage = Math.floor(skip / take) + 1;
    this.totalPages = Math.ceil(total / take);
  }
}
