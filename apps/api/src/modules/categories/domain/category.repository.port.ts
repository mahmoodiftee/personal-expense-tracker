import type { Category, CategoryKind, Flow } from '@finance/shared';
import type { BaseRepositoryPort } from '../../../common/domain/repository.port';

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');

export interface CreateCategoryData {
  readonly userId: string;
  readonly name: string;
  readonly flow: Flow;
  readonly kind: CategoryKind;
  readonly color?: string;
  readonly icon?: string;
}

export interface UpdateCategoryData {
  readonly name?: string;
  readonly color?: string;
  readonly icon?: string;
  readonly isArchived?: boolean;
}

export interface CategoryQuery {
  readonly flow?: Flow;
  readonly kind?: CategoryKind;
  readonly includeArchived?: boolean;
}

export interface CategoryRepositoryPort extends BaseRepositoryPort<
  Category,
  CreateCategoryData,
  UpdateCategoryData
> {
  /** Tenant-scoped list with optional flow/kind filtering. */
  findMany(userId: string, query?: CategoryQuery): Promise<readonly Category[]>;
  /** Batch fetch used to hydrate transaction/breakdown reads. */
  findByIds(userId: string, ids: readonly string[]): Promise<readonly Category[]>;
  /** Case-insensitive name lookup within a flow/kind (active categories only). */
  findByName(
    userId: string,
    flow: Flow,
    kind: CategoryKind,
    name: string,
  ): Promise<Category | null>;
}
