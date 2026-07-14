/**
 * Framework-agnostic pagination primitives shared by all repository ports.
 * Supports both offset pagination (page/limit) and cursor pagination for the
 * high-volume transaction feed.
 */

export interface OffsetPagination {
  readonly page: number; // 1-based
  readonly limit: number;
}

export interface CursorPagination {
  /** Opaque cursor (typically an encoded `occurredAt`+`id`). */
  readonly cursor?: string;
  readonly limit: number;
}

export interface Paginated<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly hasNextPage: boolean;
  readonly nextCursor?: string;
}

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
