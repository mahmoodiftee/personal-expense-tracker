import type { ApiFetchOptions } from '@/lib/api-client';

/** Dev-only user header until JWT auth is wired on the web client. */
export function demoFetchOptions(): ApiFetchOptions {
  const userId = process.env.NEXT_PUBLIC_DEMO_USER_ID;
  return userId ? { userId } : {};
}
