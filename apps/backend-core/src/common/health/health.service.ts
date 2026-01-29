import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Health Service
 *
 * Task: S3-D3-3 (Sprint 3, Day 3)
 * Complexity: LOW - Health check utility
 * Assigned to: HAIKU (simple service)
 *
 * Checks:
 * - Database connectivity
 * - Memory usage
 * - Service uptime
 */

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(private dataSource: DataSource) {}

  async checkHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: number;
    services: {
      database: 'up' | 'down';
      api: 'up' | 'down';
    };
    metrics: {
      memoryUsage: number;
    };
  }> {
    const timestamp = new Date().toISOString();
    const uptime = Math.floor((Date.now() - this.startTime) / 1000); // seconds

    // Check database
    let dbStatus: 'up' | 'down' = 'down';
    try {
      const result = await this.dataSource.query('SELECT 1');
      if (result) {
        dbStatus = 'up';
      }
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      dbStatus = 'down';
    }

    // Determine overall status
    const apiStatus: 'up' | 'down' = 'up'; // API is always up if this endpoint responds
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (dbStatus === 'down') {
      overallStatus = 'unhealthy';
    }

    return {
      status: overallStatus,
      timestamp,
      uptime,
      services: {
        database: dbStatus,
        api: apiStatus,
      },
      metrics: {
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
      },
    };
  }
}
