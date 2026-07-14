import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLogger } from '../../core/logger/app-logger.service';
import type { RequestContext } from '../http/request-context';

/**
 * Logs one structured line per successfully handled request with method, path,
 * status, latency, and correlation id. Failures are logged by the exception
 * filter, so this interceptor only records the success path.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<RequestContext>();
    const response = http.getResponse<Response>();
    const startedAt = request.startTime ?? Date.now();

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - startedAt;
        this.logger.log(
          `${request.method} ${request.originalUrl} -> ${response.statusCode} ${durationMs}ms [${request.id}]`,
        );
      }),
    );
  }
}
