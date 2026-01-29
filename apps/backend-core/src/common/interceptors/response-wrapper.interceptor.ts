import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

interface WrappedResponse<T> {
  data: T;
  success: true;
  timestamp: string;
}

@Injectable()
export class ResponseWrapperInterceptor<T> implements NestInterceptor<T, T | WrappedResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<T | WrappedResponse<T>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response?.statusCode;

    return next.handle().pipe(
      map((data) => {
        if (statusCode === 204) {
          return data;
        }

        if (this.isWrappedResponse(data)) {
          return data;
        }

        return {
          data,
          success: true,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private isWrappedResponse(value: unknown): value is WrappedResponse<T> {
    if (!value || typeof value !== 'object') {
      return false;
    }

    return 'data' in value && 'success' in value && 'timestamp' in value;
  }
}
