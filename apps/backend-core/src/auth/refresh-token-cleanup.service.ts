import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { RefreshTokenEntity } from '../database/entities/refresh-token.entity';

@Injectable()
export class RefreshTokenCleanupService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RefreshTokenCleanupService.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepo: Repository<RefreshTokenEntity>,
  ) {}

  onModuleInit(): void {
    if (!this.isEnabled()) return;
    const intervalMs = this.getIntervalMs();
    this.timer = setInterval(() => void this.cleanupTokens(), intervalMs);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private async cleanupTokens(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const cutoff = this.getCutoffDate();
      const result = await this.refreshTokenRepo.delete([
        { revokedAt: LessThan(cutoff) },
        { expiresAt: LessThan(cutoff) },
      ]);
      const removed = result.affected ?? 0;
      if (removed > 0) {
        this.logger.log(`Removed ${removed} stale refresh tokens`);
      }
    } catch (error) {
      this.logger.error('Refresh token cleanup failed', error);
    } finally {
      this.running = false;
    }
  }

  private getCutoffDate(): Date {
    return new Date(Date.now() - this.getRetentionMs());
  }

  private getRetentionMs(): number {
    const days = Number(process.env.REFRESH_TOKEN_RETENTION_DAYS ?? 30);
    const safeDays = Number.isFinite(days) && days > 0 ? days : 30;
    return safeDays * 24 * 60 * 60 * 1000;
  }

  private getIntervalMs(): number {
    const minutes = Number(process.env.REFRESH_TOKEN_CLEANUP_INTERVAL_MINUTES ?? 1440);
    const safeMinutes = Number.isFinite(minutes) && minutes > 0 ? minutes : 1440;
    return safeMinutes * 60 * 1000;
  }

  private isEnabled(): boolean {
    return (process.env.REFRESH_TOKEN_CLEANUP_ENABLED ?? 'true') === 'true';
  }
}
