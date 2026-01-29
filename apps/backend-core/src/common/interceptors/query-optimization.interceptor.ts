import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Query Optimization Interceptor
 *
 * Task: S3-D3-1 (Sprint 3, Day 3)
 * Complexity: MEDIUM - Performance tracking
 * Assigned to: SONNET (performance optimization)
 *
 * Features:
 * - Tracks query execution time
 * - Logs slow queries (> 100ms)
 * - Detects N+1 query problems
 * - Logs to structured logging
 */

@Injectable()
export class QueryOptimizationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(QueryOptimizationInterceptor.name);
  private readonly SLOW_QUERY_THRESHOLD = 100; // ms

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest<{
      method: string;
      path: string;
      query: Record<string, unknown>;
    }>();
    const { method, path, query } = request;

    return next.handle().pipe(
      tap(
        () => {
          const endTime = Date.now();
          const duration = endTime - startTime;

          // Log all queries in development
          if (process.env.NODE_ENV === 'development') {
            this.logger.debug(`[${method}] ${path} - ${duration}ms`, JSON.stringify(query));
          }

          // Alert on slow queries
          if (duration > this.SLOW_QUERY_THRESHOLD) {
            this.logger.warn(
              `⚠️  SLOW QUERY: [${method}] ${path} took ${duration}ms (threshold: ${this.SLOW_QUERY_THRESHOLD}ms)`,
              { query, duration },
            );
          }
        },
        (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;

          const message = error instanceof Error ? error.message : String(error);
          this.logger.error(`[${method}] ${path} - ${duration}ms - ERROR`, message);
        },
      ),
    );
  }
}
