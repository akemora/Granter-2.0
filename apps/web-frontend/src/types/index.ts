/**
 * Core domain types for GRANTER v2
 */

export type GrantStatus = 'open' | 'closed' | 'upcoming' | 'expired';

export interface Grant {
  id: string;
  title: string;
  description: string;
  amount?: number | null;
  deadline?: string | null;
  region: string;
  status?: GrantStatus;
  sectors?: string[] | null;
  beneficiaries?: string[] | null;
  officialUrl?: string | null;
  sourceId?: string | null;
  source?: GrantSource;
  createdAt: string;
}

export interface GrantSource {
  id: string;
  name: string;
  url: string;
  region: string;
  active: boolean;
  type?: string;
}

export interface SearchFilters {
  query?: string;
  regions?: string[];
  sectors?: string[];
  beneficiaries?: string[];
  minAmount?: number;
  maxAmount?: number;
  deadlineAfter?: string;
  deadlineBefore?: string;
  status?: GrantStatus;
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

export enum SourceType {
  API = 'API',
  HTML = 'HTML',
  RSS = 'RSS',
  PDF = 'PDF',
}

export interface Source {
  id: string;
  name: string;
  baseUrl: string;
  type: SourceType;
  region?: string;
  isActive: boolean;
  lastRun?: string | null;
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, unknown> | null;
}

export interface UserProfile {
  id: string;
  userId?: string;
  keywords: string[];
  minAmount?: number | null;
  maxAmount?: number | null;
  regions: string[];
  emailNotifications: boolean;
  telegramNotifications: boolean;
  email?: string | null;
  telegramChatId?: string | null;
  updatedAt: string;
}

export interface Recommendation {
  grant: Grant;
  score: number;
  matchedKeywords: string[];
}

export type NotificationChannel = 'email' | 'telegram';
export type NotificationStatus = 'sent' | 'failed';

export interface NotificationItem {
  id: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  recipient: string;
  error?: string | null;
  createdAt: string;
  sentAt?: string | null;
  grant: Grant;
}

export interface ScrapeLog {
  id: string;
  status: 'success' | 'error';
  result?: {
    method?: string;
    grantCount?: number;
    savedCount?: number;
    error?: string;
  } | null;
  timestamp: string;
}
