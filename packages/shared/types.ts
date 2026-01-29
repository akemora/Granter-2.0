export interface GrantDTO {
  id: string;
  title: string;
  amount: number;
  deadline: Date;
}

export enum SourceType {
  API = "API",
  HTML = "HTML",
  RSS = "RSS",
  PDF = "PDF",
}

export interface SourceDTO {
  id: string;
  name: string;
  baseUrl: string;
  type: SourceType;
  region?: string;
  isActive: boolean;
  lastRun?: Date;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt?: Date;
}

export interface UserProfileDTO {
  id: string;
  keywords: string[];
  minAmount?: number | null;
  maxAmount?: number | null;
  regions: string[];
  emailNotifications: boolean;
  telegramNotifications: boolean;
  email?: string | null;
  telegramChatId?: string | null;
  updatedAt: Date;
}
