import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

type ErrorDetail = {
  field?: string;
  message: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const { message, details } = this.getMessageAndDetails(exception);
    const code = this.getErrorCode(exception, status);

    response.status(status).json({
      error: {
        code,
        message,
        details,
      },
      success: false,
      timestamp: new Date().toISOString(),
    });
  }

  private getMessageAndDetails(exception: unknown): { message: string; details: ErrorDetail[] } {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      return this.extractFromResponse(response);
    }

    if (exception instanceof Error) {
      return { message: exception.message || 'Internal server error', details: [] };
    }

    return { message: 'Internal server error', details: [] };
  }

  private extractFromResponse(response: unknown): { message: string; details: ErrorDetail[] } {
    if (typeof response === 'string') {
      return { message: response, details: [] };
    }

    if (!response || typeof response !== 'object') {
      return { message: 'Request failed', details: [] };
    }

    const payload = response as { message?: string | string[] };
    if (Array.isArray(payload.message)) {
      return {
        message: 'Validation failed',
        details: payload.message.map((item) => ({ message: String(item) })),
      };
    }

    if (payload.message) {
      return { message: String(payload.message), details: [] };
    }

    return { message: 'Request failed', details: [] };
  }

  private getErrorCode(exception: unknown, status: number): string {
    if (exception instanceof HttpException) {
      return exception.name ?? `HTTP_${status}`;
    }

    return 'INTERNAL_SERVER_ERROR';
  }
}
