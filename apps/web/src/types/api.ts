import type { ApiClientError } from '@/lib/api-client';

/** Standard React Query error shape for API calls. */
export type ApiQueryError = ApiClientError;

/** Generic async state for client components. */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: ApiQueryError };
