import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Response } from 'express';
import { AppConfigService } from '../../config/app-config.service';
import type { RequestContext } from '../../common/http/request-context';

const USER_ID_HEADER = 'x-user-id';

/**
 * Resolves the tenant (`userId`) for each request and attaches it to the
 * request context. Today it honours an `x-user-id` header (useful for testing
 * multiple tenants) and otherwise falls back to the configured single-user id.
 *
 * When JWT auth lands, an `AuthGuard` replaces this by setting `req.userId` from
 * the verified token subject — no downstream code changes, because everything
 * already reads `req.userId` via {@link CurrentUserId}.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly config: AppConfigService) {}

  use(req: RequestContext, _res: Response, next: NextFunction): void {
    const header = req.headers[USER_ID_HEADER];
    const provided = Array.isArray(header) ? header[0] : header;
    req.userId = provided?.trim() || this.config.singleUserId;
    next();
  }
}
