import { renderHook, act, waitFor } from '@testing-library/react';
import { useGrants } from '../useGrants';

// Mock fetch
global.fetch = jest.fn();

const createResponse = (body: unknown) => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  headers: {
    get: (name: string) => (name === 'content-type' ? 'application/json' : null),
  },
  json: async () => body,
});

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
  currentPage: 1,
  totalPages: 1,
};

describe('useGrants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue(createResponse(mockSearchResult));
  });

  it('should initialize with empty grants', () => {
    const { result } = renderHook(() => useGrants());

    expect(result.current.grants).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should search grants', async () => {
    const { result } = renderHook(() => useGrants());

    await act(async () => {
      await result.current.search({ query: 'research' });
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

    await act(async () => {
      await result.current.search({ query: 'invalid' });
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

    await act(async () => {
      await result.current.search(filters);
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

    await act(async () => {
      await result.current.updateFilters({ query: 'new query' });
    });

    expect(result.current.filters.query).toBe('new query');
    expect(result.current.currentPage).toBe(1);
  });

  it('should not navigate when no next page', async () => {
    const { result } = renderHook(() => useGrants());

    await act(async () => {
      await result.current.search();
    });

    const initialCalls = (global.fetch as jest.Mock).mock.calls.length;

    act(() => {
      result.current.nextPage();
    });

    // Should not call fetch since totalPages is 1 and currentPage is 0
    expect((global.fetch as jest.Mock).mock.calls.length).toBe(initialCalls);
  });

  it('should refetch with current filters', async () => {
    const { result } = renderHook(() => useGrants());

    await act(async () => {
      await result.current.search({ query: 'research' });
    });

    const initialCalls = (global.fetch as jest.Mock).mock.calls.length;

    await act(async () => {
      await result.current.refetch();
    });

    expect((global.fetch as jest.Mock).mock.calls.length).toBe(
      initialCalls + 1
    );
  });

  it('should handle pagination with multiple pages', async () => {
    const page1Result = {
      data: mockGrants,
      total: 40,
      skip: 0,
      take: 20,
      currentPage: 1,
      totalPages: 2,
    };

    const page2Result = {
      data: mockGrants,
      total: 40,
      skip: 20,
      take: 20,
      currentPage: 2,
      totalPages: 2,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce(createResponse(page1Result));

    const { result } = renderHook(() => useGrants());

    await act(async () => {
      await result.current.search();
    });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(2);

    (global.fetch as jest.Mock).mockResolvedValueOnce(createResponse(page2Result));

    await act(async () => {
      await result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);
  });

  it('should clamp page navigation', async () => {
    const { result } = renderHook(() => useGrants());

    await act(async () => {
      await result.current.search();
    });

    // Try to go to negative page
    act(() => {
      result.current.goToPage(-1);
    });

    // Current page should not change
    expect(result.current.currentPage).toBe(1);
  });
});
