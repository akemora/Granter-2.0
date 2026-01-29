import { calculatePagination, calculatePaginationMetadata, validatePaginationParams } from '../pagination.utils';

describe('pagination utils', () => {
  describe('calculatePagination', () => {
    it('uses defaults when values are undefined', () => {
      expect(calculatePagination()).toEqual({ skip: 0, take: 20 });
    });

    it('clamps take to max and skip to zero', () => {
      expect(calculatePagination(-5, 500)).toEqual({ skip: 0, take: 100 });
    });

    it('accepts valid skip/take values', () => {
      expect(calculatePagination(10, 15)).toEqual({ skip: 10, take: 15 });
    });
  });

  describe('validatePaginationParams', () => {
    it('throws on negative skip', () => {
      expect(() => validatePaginationParams(-1, 10)).toThrow('Skip parameter cannot be negative');
    });

    it('throws on non-positive take', () => {
      expect(() => validatePaginationParams(0, 0)).toThrow('Take parameter must be greater than 0');
    });

    it('does not throw on valid values', () => {
      expect(() => validatePaginationParams(0, 10)).not.toThrow();
    });
  });

  describe('calculatePaginationMetadata', () => {
    it('returns correct metadata for first page', () => {
      expect(calculatePaginationMetadata(0, 10, 35)).toEqual({
        currentPage: 1,
        totalPages: 4,
        hasNextPage: true,
        hasPreviousPage: false,
      });
    });

    it('returns correct metadata for middle page', () => {
      expect(calculatePaginationMetadata(10, 10, 35)).toEqual({
        currentPage: 2,
        totalPages: 4,
        hasNextPage: true,
        hasPreviousPage: true,
      });
    });
  });
});
