import { Injectable, type NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Response, NextFunction } from 'express';
import { REQUEST_ID_HEADER, type RequestContext } from '../http/request-context';

/**
 * Assigns a correlation id to every request (honouring an inbound
 * `x-request-id` if a proxy/gateway already set one) and echoes it back on the
 * response. This id threads through logs, the response envelope, and error
 * payloads so a single request can be traced end-to-end.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestContext, res: Response, next: NextFunction): void {
    const inbound = req.headers[REQUEST_ID_HEADER];
    const requestId = (Array.isArray(inbound) ? inbound[0] : inbound) || randomUUID();

    req.id = requestId;
    req.startTime = Date.now();
    res.setHeader(REQUEST_ID_HEADER, requestId);

    next();
  }
}
