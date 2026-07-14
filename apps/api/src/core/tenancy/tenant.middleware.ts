import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Response } from 'express';
import { AppConfigService } from '../../config/app-config.service';
import type { RequestContext } from '../../common/http/request-context';

const USER_ID_HEADER = 'x-user-id';

/**
 * Resolves the tenant (`userId`) for each request and attaches it to the
 * request context.
 *
 * Development: honours `x-user-id` for multi-tenant testing.
 * Production: ignores the header and always uses `SINGLE_USER_ID` until JWT auth
 * replaces this middleware — prevents tenant spoofing via a client header.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly config: AppConfigService) {}

  use(req: RequestContext, _res: Response, next: NextFunction): void {
    if (this.config.isProduction) {
      req.userId = this.config.singleUserId;
      next();
      return;
    }

    const header = req.headers[USER_ID_HEADER];
    const provided = Array.isArray(header) ? header[0] : header;
    req.userId = provided?.trim() || this.config.singleUserId;
    next();
  }
}
