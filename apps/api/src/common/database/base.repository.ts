import {
  type FilterQuery,
  type HydratedDocument,
  type Model,
  type SortOrder,
  Types,
  type UpdateQuery,
} from 'mongoose';
import { MAX_PAGE_SIZE } from '../domain/pagination';

/** Result of an offset-paginated document query. */
export interface OffsetPageResult<TDoc> {
  readonly docs: HydratedDocument<TDoc>[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly hasNextPage: boolean;
}

/**
 * Generic Mongoose repository base. Provides reusable, tenant-scoped document
 * operations and document→domain mapping so concrete repositories stay thin and
 * free of duplicated persistence plumbing (DRY, SRP).
 *
 * Subclasses implement {@link toDomain} and compose these protected helpers to
 * satisfy their domain repository *port*. The rest of the app depends on the
 * port, never on this class or on Mongoose (Dependency Inversion).
 *
 * @typeParam TDoc    - the Mongoose schema class.
 * @typeParam TEntity - the framework-free domain read model.
 */
export abstract class MongoBaseRepository<TDoc, TEntity> {
  protected constructor(protected readonly model: Model<TDoc>) {}

  /** Map a persisted document to its domain read model. */
  protected abstract toDomain(doc: HydratedDocument<TDoc>): TEntity;

  protected mapMany(docs: HydratedDocument<TDoc>[]): TEntity[] {
    return docs.map((doc) => this.toDomain(doc));
  }

  /** Parse a string id to an ObjectId, or null if it is malformed. */
  protected toObjectId(id: string): Types.ObjectId | null {
    return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;
  }

  /** Build a tenant-scoped filter. Every tenant query goes through here. */
  protected scopedFilter(userId: string, extra: FilterQuery<TDoc> = {}): FilterQuery<TDoc> {
    return { userId: this.toObjectId(userId), ...extra } as FilterQuery<TDoc>;
  }

  protected async insertOne(data: Partial<TDoc>): Promise<HydratedDocument<TDoc>> {
    return this.model.create(data);
  }

  protected async findScopedById(
    userId: string,
    id: string,
  ): Promise<HydratedDocument<TDoc> | null> {
    const objectId = this.toObjectId(id);
    if (!objectId) return null;
    return this.model
      .findOne(this.scopedFilter(userId, { _id: objectId } as FilterQuery<TDoc>))
      .exec();
  }

  protected async updateScopedById(
    userId: string,
    id: string,
    update: UpdateQuery<TDoc>,
  ): Promise<HydratedDocument<TDoc> | null> {
    const objectId = this.toObjectId(id);
    if (!objectId) return null;
    return this.model
      .findOneAndUpdate(this.scopedFilter(userId, { _id: objectId } as FilterQuery<TDoc>), update, {
        new: true,
      })
      .exec();
  }

  protected async deleteScopedById(userId: string, id: string): Promise<boolean> {
    const objectId = this.toObjectId(id);
    if (!objectId) return false;
    const result = await this.model
      .deleteOne(this.scopedFilter(userId, { _id: objectId } as FilterQuery<TDoc>))
      .exec();
    return result.deletedCount === 1;
  }

  /** Offset pagination with a bounded page size and a parallel count. */
  protected async paginateOffset(
    filter: FilterQuery<TDoc>,
    page: number,
    limit: number,
    sort: Record<string, SortOrder>,
  ): Promise<OffsetPageResult<TDoc>> {
    const safeLimit = Math.min(Math.max(limit, 1), MAX_PAGE_SIZE);
    const safePage = Math.max(page, 1);
    const skip = (safePage - 1) * safeLimit;

    const [docs, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(safeLimit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return {
      docs,
      total,
      page: safePage,
      limit: safeLimit,
      hasNextPage: skip + docs.length < total,
    };
  }
}
