import { renderHook, act, waitFor } from '@testing-library/react';
import { useGrants } from '../useGrants';

// Mock fetch
global.fetch = jest.fn();

const mockGrants = [
  {
    id: '1',
    title: 'Test Grant 1',
    description: 'Description 1',
    amount: 50000,
    deadline: '2026-12-31',
    region: 'ES',
    createdAt: '2026-01-28T10:00:00Z',
  },
  {
    id: '2',
    title: 'Test Grant 2',
    description: 'Description 2',
    amount: 100000,
    deadline: '2026-12-31',
    region: 'EU',
    createdAt: '2026-01-27T10:00:00Z',
  },
];

const mockSearchResult = {
  data: mockGrants,
  total: 2,
  skip: 0,
  take: 20,
  currentPage: 0,
  totalPages: 1,
};

describe('useGrants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockSearchResult,
    });
  });

  it('should initialize with empty grants', () => {
    const { result } = renderHook(() => useGrants());

    expect(result.current.grants).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should search grants', async () => {
    const { result } = renderHook(() => useGrants());

    act(() => {
      result.current.search({ query: 'research' });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.grants).toEqual(mockGrants);
    expect(result.current.total).toBe(2);
  });

  it('should handle search errors', async () => {
    const errorMessage = 'Search failed';
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error(errorMessage)
    );

    const { result } = renderHook(() => useGrants());

    act(() => {
      result.current.search({ query: 'invalid' });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.grants).toEqual([]);
  });

  it('should build correct query params', async () => {
    const { result } = renderHook(() => useGrants());

    const filters = {
      query: 'research',
      regions: ['ES', 'EU'],
      minAmount: 10000,
      maxAmount: 100000,
    };

    act(() => {
      result.current.search(filters);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(callUrl).toContain('query=research');
    expect(callUrl).toContain('regions=ES');
    expect(callUrl).toContain('regions=EU');
    expect(callUrl).toContain('minAmount=10000');
    expect(callUrl).toContain('maxAmount=100000');
  });

  it('should update filters and reset pagination', async () => {
    const { result } = renderHook(() => useGrants());

    act(() => {
      result.current.updateFilters({ query: 'new query' });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.filters.query).toBe('new query');
    expect(result.current.currentPage).toBe(0);
  });

  it('should navigate to next page', async () => {
    const manyGrants = Array.from({ length: 50 }, (_, i) => ({
      ...mockGrants[0],
      id: `${i}`,
      title: `Grant ${i}`,
    }));

    const pagedResult = {
      data: manyGrants.slice(20, 40),
      total: 50,
      skip: 20,
      take: 20,
      currentPage: 1,
      totalPages: 3,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResult,
    });

    const { result } = renderHook(() => useGrants());

    // Initial search
    act(() => {
      result.current.search();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Mock next page result
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => pagedResult,
    });

    // Go to next page
    act(() => {
      result.current.nextPage();
    });

    await waitFor(() => {
      expect(result.current.currentPage).toBe(1);
    });
  });

  it('should not navigate past total pages', async () => {
    const { result } = renderHook(() => useGrants());

    act(() => {
      result.current.search();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialUrl = (global.fetch as jest.Mock).mock.calls[0][0];

    act(() => {
      result.current.nextPage();
    });

    // Should not have called fetch for next page
    expect((global.fetch as jest.Mock).mock.calls.length).toBe(1);
  });

  it('should refetch with current filters', async () => {
    const { result } = renderHook(() => useGrants());

    act(() => {
      result.current.search({ query: 'research' });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResult,
    });

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect((global.fetch as jest.Mock)).toHaveBeenCalled();
    const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(callUrl).toContain('query=research');
  });

  it('should track pagination state correctly', async () => {
    const { result } = renderHook(() => useGrants());

    act(() => {
      result.current.search();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.currentPage).toBe(0);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.total).toBe(2);
    expect(result.current.hasPrevPage).toBe(false);
    expect(result.current.hasNextPage).toBe(false);
  });
});
