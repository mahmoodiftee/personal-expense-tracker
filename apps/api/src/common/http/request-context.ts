import type { Request } from 'express';

/**
 * Express request augmented with per-request context set by middleware.
 * `id` is the correlation id echoed in responses and logs; `startTime` supports
 * latency measurement in the logging interceptor.
 */
export interface RequestContext extends Request {
  id: string;
  startTime: number;
  /** Set once auth lands — the tenant scope for every downstream query. */
  userId?: string;
}

export const REQUEST_ID_HEADER = 'x-request-id';
