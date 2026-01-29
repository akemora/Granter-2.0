'use client';

import { useCallback, useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';
import { Grant, SearchFilters, SearchResult, PaginationOptions } from '../types';

export interface UseGrantsOptions {
  initialFilters?: SearchFilters;
  initialPagination?: PaginationOptions;
}

export function useGrants(options?: UseGrantsOptions) {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [filters, setFilters] = useState<SearchFilters>(
    options?.initialFilters ?? {}
  );
  const [pagination, setPagination] = useState<PaginationOptions>(
    options?.initialPagination ?? { skip: 0, take: 20 }
  );

  const search = useCallback(
    async (newFilters?: SearchFilters, newPagination?: PaginationOptions) => {
      setIsLoading(true);
      setError(null);

      try {
        const appliedFilters = newFilters ?? filters;
        const appliedPagination = newPagination ?? pagination;

        // Build query params
        const params = new URLSearchParams();
        params.append('skip', appliedPagination.skip.toString());
        params.append('take', appliedPagination.take.toString());

        if (appliedFilters.query) {
          params.append('query', appliedFilters.query);
        }
        if (appliedFilters.regions?.length) {
          appliedFilters.regions.forEach((r) => params.append('regions', r));
        }
        if (appliedFilters.sectors?.length) {
          appliedFilters.sectors.forEach((s) => params.append('sectors', s));
        }
        if (appliedFilters.beneficiaries?.length) {
          appliedFilters.beneficiaries.forEach((b) =>
            params.append('beneficiaries', b)
          );
        }
        if (appliedFilters.minAmount !== undefined) {
          params.append('minAmount', appliedFilters.minAmount.toString());
        }
        if (appliedFilters.maxAmount !== undefined) {
          params.append('maxAmount', appliedFilters.maxAmount.toString());
        }
        if (appliedFilters.deadlineAfter) {
          params.append('deadlineAfter', appliedFilters.deadlineAfter);
        }
        if (appliedFilters.deadlineBefore) {
          params.append('deadlineBefore', appliedFilters.deadlineBefore);
        }
        if (appliedFilters.status) {
          params.append('status', appliedFilters.status);
        }

        const result = (await fetchApi(`/search?${params.toString()}`)) as SearchResult;
        setGrants(result.data);
        setTotal(result.total);
        setCurrentPage(result.currentPage);
        setTotalPages(result.totalPages);
        setFilters(appliedFilters);
        setPagination(appliedPagination);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        setGrants([]);
      } finally {
        setIsLoading(false);
      }
    },
    [filters, pagination]
  );

  const refetch = useCallback(() => {
    return search(filters, pagination);
  }, [search, filters, pagination]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateFilters = useCallback(
    (newFilters: SearchFilters) => {
      setFilters(newFilters);
      // Reset to first page when filters change
      return search(newFilters, { skip: 0, take: pagination.take });
    },
    [search, pagination]
  );

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;
      const newPagination = {
        ...pagination,
        skip: (page - 1) * pagination.take,
      };
      return search(filters, newPagination);
    },
    [search, filters, pagination, totalPages]
  );

  const nextPage = useCallback(() => {
    return goToPage(currentPage + 1);
  }, [goToPage, currentPage]);

  const prevPage = useCallback(() => {
    return goToPage(currentPage - 1);
  }, [goToPage, currentPage]);

  // Auto-search on mount if filters provided
  useEffect(() => {
    if (options?.initialFilters) {
      search(options.initialFilters, options.initialPagination);
    }
  }, [options?.initialFilters, options?.initialPagination, search]);

  return {
    // Data
    grants,
    total,
    currentPage,
    totalPages,
    isLoading,
    error,

    // Filters
    filters,
    updateFilters,

    // Pagination
    pagination,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,

    // Actions
    search,
    refetch,
    clearError,
  };
}
