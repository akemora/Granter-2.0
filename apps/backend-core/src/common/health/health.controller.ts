import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

/**
 * Health Check Controller
 *
 * Task: S3-D3-3 (Sprint 3, Day 3)
 * Complexity: LOW - Simple health endpoint
 * Assigned to: HAIKU (simple endpoint)
 *
 * Features:
 * - Database health check
 * - Service status
 * - Uptime tracking
 * - Detailed health metrics
 */

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: 'up' | 'down';
    cache?: 'up' | 'down';
    api: 'up' | 'down';
  };
  metrics?: {
    memoryUsage: number;
    cpuUsage?: number;
  };
}

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * GET /health
   *
   * Returns health status of the application
   *
   * Response:
   * {
   *   "status": "healthy",
   *   "timestamp": "2026-01-28T12:00:00Z",
   *   "uptime": 3600,
   *   "services": {
   *     "database": "up",
   *     "api": "up"
   *   }
   * }
   */
  @Get()
  async check(): Promise<HealthCheckResponse> {
    const status = await this.healthService.checkHealth();
    return status;
  }

  /**
   * GET /health/ready
   *
   * Kubernetes readiness probe
   * Returns 200 if service is ready to accept traffic
   */
  @Get('ready')
  async readiness(): Promise<{ ready: boolean }> {
    const status = await this.healthService.checkHealth();
    const ready = status.status !== 'unhealthy';
    return { ready };
  }

  /**
   * GET /health/live
   *
   * Kubernetes liveness probe
   * Returns 200 if service is alive
   */
  @Get('live')
  async liveness(): Promise<{ alive: boolean }> {
    return { alive: true };
  }
}
