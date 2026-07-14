/**
 * Base repository contract (a domain *port*). Concrete Mongoose adapters
 * implement it in the infrastructure layer and are bound via DI tokens, so the
 * application layer depends only on this abstraction (Dependency Inversion).
 *
 * @typeParam TEntity - the domain read model (framework-free).
 * @typeParam TCreate - the data required to create an entity.
 * @typeParam TUpdate - the mutable subset of an entity.
 */
export interface BaseRepositoryPort<TEntity, TCreate, TUpdate> {
  create(data: TCreate): Promise<TEntity>;

  /** Tenant-scoped: only returns the entity if it belongs to `userId`. */
  findById(userId: string, id: string): Promise<TEntity | null>;

  /** Tenant-scoped partial update; returns the updated entity or null. */
  update(userId: string, id: string, changes: TUpdate): Promise<TEntity | null>;

  /** Tenant-scoped hard delete; returns true if a document was removed. */
  delete(userId: string, id: string): Promise<boolean>;
}
