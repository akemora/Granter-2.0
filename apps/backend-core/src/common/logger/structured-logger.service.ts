import { Injectable, Logger as NestLogger } from '@nestjs/common';

/**
 * Structured Logger Service
 *
 * Task: S3-D3-2 (Sprint 3, Day 3)
 * Complexity: LOW - Logging utility
 * Assigned to: HAIKU (simple logger wrapper)
 *
 * Features:
 * - JSON structured logging
 * - Pino-compatible format
 * - Correlation IDs for request tracing
 * - Performance metrics
 * - Production-ready
 */

export interface LogMetadata {
  userId?: string;
  requestId?: string;
  path?: string;
  method?: string;
  duration?: number;
  statusCode?: number;
  errorCode?: string;
  [key: string]: any;
}

@Injectable()
export class StructuredLoggerService {
  private nestLogger = new NestLogger();

  /**
   * Log with structured format
   * Output: {"level":"info","timestamp":"...","message":"...","context":"...","metadata":{...}}
   */
  log(message: string, context?: string, metadata?: LogMetadata) {
    const logEntry = this.formatLog('info', message, context, metadata);
    console.log(JSON.stringify(logEntry));
  }

  debug(message: string, context?: string, metadata?: LogMetadata) {
    if (process.env.NODE_ENV === 'development') {
      const logEntry = this.formatLog('debug', message, context, metadata);
      console.debug(JSON.stringify(logEntry));
    }
  }

  warn(message: string, context?: string, metadata?: LogMetadata) {
    const logEntry = this.formatLog('warn', message, context, metadata);
    console.warn(JSON.stringify(logEntry));
  }

  error(message: string, error?: Error | string, context?: string, metadata?: LogMetadata) {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    const logEntry = this.formatLog('error', message, context, {
      ...metadata,
      error: errorMessage,
      stack: errorStack,
    });

    console.error(JSON.stringify(logEntry));
  }

  /**
   * Log HTTP request
   */
  logRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    userId?: string
  ) {
    this.log(`${method} ${path} - ${statusCode}`, 'HTTP', {
      method,
      path,
      statusCode,
      duration,
      userId,
    });
  }

  /**
   * Log database query
   */
  logQuery(query: string, duration: number, params?: any) {
    if (duration > 100) {
      this.warn(`Slow query detected: ${duration}ms`, 'DATABASE', {
        query,
        duration,
        params,
      });
    } else if (process.env.NODE_ENV === 'development') {
      this.debug(`Query: ${query}`, 'DATABASE', { duration });
    }
  }

  /**
   * Log service operation
   */
  logOperation(
    operation: string,
    status: 'success' | 'failure',
    duration: number,
    metadata?: LogMetadata
  ) {
    const level = status === 'success' ? 'info' : 'error';
    const logEntry = this.formatLog(level, `${operation} - ${status}`, 'OPERATION', {
      operation,
      status,
      duration,
      ...metadata,
    });

    if (level === 'error') {
      console.error(JSON.stringify(logEntry));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }

  private formatLog(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    context?: string,
    metadata?: LogMetadata
  ) {
    return {
      level,
      timestamp: new Date().toISOString(),
      message,
      context: context || 'Application',
      ...(metadata && { metadata }),
    };
  }
}
