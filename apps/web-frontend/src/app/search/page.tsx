'use client';

import { useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { useGrants } from '@/hooks/useGrants';
import { SearchInput } from '@/components/molecules/SearchInput/SearchInput';
import { FilterPanel } from '@/components/molecules/FilterPanel/FilterPanel';
import { GrantCard } from '@/components/molecules/GrantCard/GrantCard';
import { Pagination } from '@/components/molecules/Pagination/Pagination';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner/LoadingSpinner';
import { ErrorMessage } from '@/components/atoms/ErrorMessage/ErrorMessage';
import type { SearchFilters } from '@/types';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize useGrants hook
  const {
    grants,
    total,
    currentPage,
    totalPages,
    isLoading: loading,
    error,
    filters,
    updateFilters,
    search,
    nextPage,
    prevPage,
    goToPage,
  } = useGrants({
    initialPagination: { skip: 0, take: 20 },
  });

  // Load filters from URL query params on mount
  useEffect(() => {
    const newFilters: SearchFilters = {};

    const query = searchParams.get('query');
    if (query) newFilters.query = query;

    const regions = searchParams.getAll('regions');
    if (regions.length > 0) newFilters.regions = regions;

    const sectors = searchParams.getAll('sectors');
    if (sectors.length > 0) newFilters.sectors = sectors;

    const minAmount = searchParams.get('minAmount');
    if (minAmount) newFilters.minAmount = Number(minAmount);

    const maxAmount = searchParams.get('maxAmount');
    if (maxAmount) newFilters.maxAmount = Number(maxAmount);

    const deadlineAfter = searchParams.get('deadlineAfter');
    if (deadlineAfter) newFilters.deadlineAfter = deadlineAfter;

    const deadlineBefore = searchParams.get('deadlineBefore');
    if (deadlineBefore) newFilters.deadlineBefore = deadlineBefore;

    // Initial search with filters from URL
    if (Object.keys(newFilters).length > 0) {
      search(newFilters);
    }
  }, []);

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const merged = { ...filters, ...newFilters };
    updateFilters(merged);

    // Update URL with current filters
    const params = new URLSearchParams();
    if (merged.query) params.append('query', merged.query);
    if (merged.regions?.length) {
      merged.regions.forEach((r) => params.append('regions', r));
    }
    if (merged.sectors?.length) {
      merged.sectors.forEach((s) => params.append('sectors', s));
    }
    if (merged.minAmount !== undefined) params.append('minAmount', String(merged.minAmount));
    if (merged.maxAmount !== undefined) params.append('maxAmount', String(merged.maxAmount));
    if (merged.deadlineAfter) params.append('deadlineAfter', merged.deadlineAfter);
    if (merged.deadlineBefore) params.append('deadlineBefore', merged.deadlineBefore);

    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const handleQueryChange = (query: string) => {
    handleFilterChange({ query: query || undefined });
  };

  const handlePageChange = (page: number) => {
    goToPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Debounce search on filter changes
  useDebounce(() => search(filters), 300, [filters]);

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-neutral-900 mb-2">Search Grants</h1>
          <p className="text-neutral-600">
            Find government grants and funding opportunities that match your needs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Panel */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8">
              <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Search Input */}
            <SearchInput
              value={filters.query || ''}
              onChange={handleQueryChange}
              placeholder="Search grants by title or description..."
            />

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <ErrorMessage
                message={error}
                onDismiss={() => setError(null)}
              />
            )}

            {/* Results */}
            {!loading && grants.length > 0 && (
              <>
                <div className="mb-4 text-sm text-neutral-600">
                  Found <span className="font-semibold text-neutral-900">{total}</span> grants
                </div>

                <div className="space-y-4 mb-8">
                  {grants.map((grant) => (
                    <GrantCard key={grant.id} grant={grant} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}

            {/* No Results State */}
            {!loading && grants.length === 0 && total > 0 && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="mt-4 text-neutral-600">No grants found. Try different filters.</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && grants.length === 0 && !error && total === 0 && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="mt-4 text-neutral-600">Start searching to see results</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
