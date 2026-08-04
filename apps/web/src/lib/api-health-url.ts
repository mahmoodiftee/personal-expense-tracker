import { env } from './env';

/** Lightweight liveness probe — use for warm-up pings (no Mongo check). */
export function apiHealthLiveUrl(): string {
  const base = env.NEXT_PUBLIC_API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  return `${base}/api/health/live`;
}
