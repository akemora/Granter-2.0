/**
 * Core domain types for GRANTER v2
 */

export interface Grant {
  id: string;
  title: string;
  description: string;
  amount: number;
  deadline: string;
  region: string;
  createdAt: string;
}

export interface SearchFilters {
  query?: string;
  regions?: string[];
  sectors?: string[];
  minAmount?: number;
  maxAmount?: number;
  deadlineAfter?: string;
  deadlineBefore?: string;
  status?: string;
}

export interface SearchResult {
  data: Grant[];
  total: number;
  skip: number;
  take: number;
  currentPage: number;
  totalPages: number;
}

export interface PaginationOptions {
  skip: number;
  take: number;
}
