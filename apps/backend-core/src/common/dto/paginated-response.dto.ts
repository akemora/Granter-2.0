/**
 * Generic paginated response wrapper for list endpoints
 * @template T - The type of items in the data array
 */
export class PaginatedResponse<T> {
  /**
   * Array of items in the current page
   */
  data: T[];

  /**
   * Total number of items in the database (across all pages)
   */
  total: number;

  /**
   * Number of items skipped from the beginning
   */
  skip: number;

  /**
   * Maximum number of items per page (limit)
   */
  take: number;

  constructor(data: T[], total: number, skip: number, take: number) {
    this.data = data;
    this.total = total;
    this.skip = skip;
    this.take = take;
  }

  /**
   * Calculates the current page number (1-indexed)
   * @returns Current page number
   */
  get currentPage(): number {
    return Math.floor(this.skip / this.take) + 1;
  }

  /**
   * Calculates the total number of pages
   * @returns Total number of pages
   */
  get totalPages(): number {
    return Math.ceil(this.total / this.take);
  }

  /**
   * Determines if there is a next page available
   * @returns True if there is a next page
   */
  get hasNextPage(): boolean {
    return this.skip + this.take < this.total;
  }

  /**
   * Determines if there is a previous page available
   * @returns True if there is a previous page
   */
  get hasPreviousPage(): boolean {
    return this.skip > 0;
  }

  /**
   * Calculates the number of items on the current page
   * @returns Number of items on current page
   */
  get itemsOnPage(): number {
    return this.data.length;
  }
}
