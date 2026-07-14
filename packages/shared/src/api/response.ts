/**
 * API response envelope contracts. Shared by the backend (which produces them)
 * and the web client (which consumes them) so the wire format has exactly one
 * definition. Every endpoint returns one of these shapes.
 */

/** Stable, machine-readable error codes. Clients switch on these, not on prose. */
export enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMITED = 'RATE_LIMITED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/** Metadata attached to every response for tracing and diagnostics. */
export interface ApiMeta {
  readonly requestId: string;
  readonly timestamp: string; // ISO-8601
}

/** Pagination metadata added to list responses. */
export interface ApiPaginationMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly hasNextPage: boolean;
  readonly nextCursor?: string;
}

/** A single field-level validation problem. */
export interface ApiFieldError {
  readonly field: string;
  readonly issue: string;
}

export interface ApiSuccessResponse<T> {
  readonly success: true;
  readonly data: T;
  readonly meta: ApiMeta & { readonly pagination?: ApiPaginationMeta };
}

export interface ApiErrorResponse {
  readonly success: false;
  readonly error: {
    readonly code: ApiErrorCode | string;
    readonly message: string;
    readonly details?: readonly ApiFieldError[];
  };
  readonly meta: ApiMeta;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/** Type guard narrowing an envelope to its success branch. */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success === true;
}
