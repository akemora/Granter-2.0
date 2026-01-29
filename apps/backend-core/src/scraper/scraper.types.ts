import { GrantStatus } from '../common/enums/grant-status.enum';

export type ScraperMethod = 'smart' | 'generic' | 'api' | 'rss' | 'pdf' | 'error';

export interface ScrapedGrant {
  title: string;
  description: string;
  amount?: number;
  deadline?: string;
  url?: string;
  status?: GrantStatus;
  sectors?: string[];
  beneficiaries?: string[];
}

export interface SourceHandlerResult {
  grants: ScrapedGrant[];
  method: ScraperMethod;
  error?: string;
}
