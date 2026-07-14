import {
  type ApiPaginationMeta,
  type ApiResponse,
  type ApiSuccessResponse,
  isApiSuccess,
} from '@finance/shared';

import { env } from './env';

export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
  }
}

export type ApiFetchOptions = RequestInit & {
  /** Optional user id for dev/staging when auth is not wired yet. */
  userId?: string;
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { userId, headers, ...init } = options;

  const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(userId ? { 'x-user-id': userId } : {}),
      ...headers,
    },
  });

  let body: ApiResponse<T>;
  try {
    body = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError('PARSE_ERROR', 'Invalid response from server', response.status);
  }

  if (!isApiSuccess(body)) {
    throw new ApiClientError(body.error.code, body.error.message, response.status);
  }

  return body.data;
}

export type PaginatedResult<T> = {
  items: T[];
  pagination: ApiPaginationMeta;
};

export async function apiFetchPaginated<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<PaginatedResult<T>> {
  const { userId, headers, ...init } = options;

  const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(userId ? { 'x-user-id': userId } : {}),
      ...headers,
    },
  });

  let body: ApiSuccessResponse<T[]> | ApiResponse<T[]>;
  try {
    body = (await response.json()) as ApiSuccessResponse<T[]> | ApiResponse<T[]>;
  } catch {
    throw new ApiClientError('PARSE_ERROR', 'Invalid response from server', response.status);
  }

  if (!isApiSuccess(body)) {
    throw new ApiClientError(body.error.code, body.error.message, response.status);
  }

  if (!body.meta.pagination) {
    throw new ApiClientError('PAGINATION_MISSING', 'Expected pagination metadata', response.status);
  }

  return { items: body.data, pagination: body.meta.pagination };
}
