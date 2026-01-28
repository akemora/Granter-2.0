const MAX_ITEMS_PER_PAGE = 100;
const DEFAULT_SKIP = 0;
const DEFAULT_TAKE = 20;

export interface PaginationParams {
  skip: number;
  take: number;
}

/**
 * Calculates safe pagination parameters with enforced limits
 * @param skip - Number of items to skip (default: 0, min: 0)
 * @param take - Number of items to take (default: 20, min: 1, max: 100)
 * @returns PaginationParams with safe skip and take values
 *
 * Rules:
 * - skip defaults to 0 if not provided or negative
 * - take defaults to 20 if not provided
 * - take is capped to MAX_ITEMS_PER_PAGE (100) if it exceeds the limit
 * - take must be at least 1
 */
export function calculatePagination(
  skip?: number,
  take?: number,
): PaginationParams {
  const safeSkip = skip !== undefined && skip >= 0 ? skip : DEFAULT_SKIP;
  const baseTake = take !== undefined && take >= 1 ? take : DEFAULT_TAKE;
  const safeTake = Math.min(baseTake, MAX_ITEMS_PER_PAGE);

  return {
    skip: safeSkip,
    take: safeTake,
  };
}

/**
 * Validates pagination parameters and throws errors for invalid values
 * @param skip - Skip parameter to validate
 * @param take - Take parameter to validate
 * @throws Error if skip is negative or take is <= 0
 */
export function validatePaginationParams(
  skip?: number,
  take?: number,
): void {
  if (skip !== undefined && skip < 0) {
    throw new Error('Skip parameter cannot be negative');
  }

  if (take !== undefined && take <= 0) {
    throw new Error('Take parameter must be greater than 0');
  }
}

/**
 * Calculates pagination metadata for response
 * @param skip - Current skip value
 * @param take - Current take value
 * @param total - Total number of items in database
 * @returns Pagination metadata with currentPage and totalPages
 */
export function calculatePaginationMetadata(
  skip: number,
  take: number,
  total: number,
): {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
} {
  const currentPage = Math.floor(skip / take) + 1;
  const totalPages = Math.ceil(total / take);
  const hasNextPage = skip + take < total;
  const hasPreviousPage = skip > 0;

  return {
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
}
