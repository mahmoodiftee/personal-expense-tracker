import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { ApiPaginationMeta, ApiSuccessResponse } from '@finance/shared';
import type { RequestContext } from '../http/request-context';

/** Shape a service returns for a paginated list; lifted into `meta.pagination`. */
interface MaybePaginated {
  items: unknown[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  nextCursor?: string;
}

/**
 * Wraps every successful controller return value in the shared success envelope,
 * attaching `requestId` + `timestamp`. If the value is a paginated result, the
 * pagination fields are lifted into `meta.pagination` and `items` becomes `data`.
 * Controllers therefore return plain domain data and stay envelope-agnostic (DRY).
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiSuccessResponse<unknown>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<unknown>> {
    const request = context.switchToHttp().getRequest<RequestContext>();
    const requestId = request.id ?? 'unknown';

    return next.handle().pipe(
      map((payload): ApiSuccessResponse<unknown> => {
        const meta = { requestId, timestamp: new Date().toISOString() };

        if (this.isPaginated(payload)) {
          const { items, ...pagination } = payload;
          return {
            success: true,
            data: items,
            meta: { ...meta, pagination: pagination as ApiPaginationMeta },
          };
        }

        return { success: true, data: payload ?? null, meta };
      }),
    );
  }

  private isPaginated(payload: unknown): payload is MaybePaginated {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      Array.isArray((payload as MaybePaginated).items) &&
      typeof (payload as MaybePaginated).hasNextPage === 'boolean' &&
      typeof (payload as MaybePaginated).total === 'number'
    );
  }
}
