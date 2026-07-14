import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { RequestContext } from '../http/request-context';

/**
 * Injects the resolved tenant id (`userId`) into a controller handler.
 * The value is set upstream by the tenancy middleware (or, later, the auth
 * guard), so controllers never read it from the client body/query — closing the
 * primary multi-tenant isolation hole.
 */
export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestContext>();
    return request.userId ?? '';
  },
);
