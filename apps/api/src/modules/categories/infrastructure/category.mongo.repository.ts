import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type FilterQuery, type HydratedDocument, type Model, Types } from 'mongoose';
import { CategoryKind, Flow, type Category } from '@finance/shared';

import { MongoBaseRepository } from '../../../common/database/base.repository';
import { DomainValidationException } from '../../../common/exceptions/app.exception';
import type {
  CategoryQuery,
  CategoryRepositoryPort,
  CreateCategoryData,
  UpdateCategoryData,
} from '../domain/category.repository.port';
import { toCategory } from './category.mapper';
import { CategoryEntity } from './category.schema';

@Injectable()
export class CategoryMongoRepository
  extends MongoBaseRepository<CategoryEntity, Category>
  implements CategoryRepositoryPort
{
  constructor(@InjectModel(CategoryEntity.name) model: Model<CategoryEntity>) {
    super(model);
  }

  protected toDomain(doc: HydratedDocument<CategoryEntity>): Category {
    return toCategory(doc);
  }

  async create(data: CreateCategoryData): Promise<Category> {
    const userObjectId = this.toObjectId(data.userId);
    if (!userObjectId) throw new DomainValidationException('Invalid user context');

    const doc = await this.insertOne({
      userId: userObjectId,
      name: data.name.trim(),
      flow: data.flow,
      kind: data.kind,
      color: data.color ?? '#64748b',
      icon: data.icon ?? 'tag',
      isArchived: false,
    });

    return this.toDomain(doc);
  }

  async findById(userId: string, id: string): Promise<Category | null> {
    const doc = await this.findScopedById(userId, id);
    return doc ? this.toDomain(doc) : null;
  }

  async update(userId: string, id: string, changes: UpdateCategoryData): Promise<Category | null> {
    const set: Record<string, unknown> = {};
    if (changes.name !== undefined) set.name = changes.name.trim();
    if (changes.color !== undefined) set.color = changes.color;
    if (changes.icon !== undefined) set.icon = changes.icon;
    if (changes.isArchived !== undefined) set.isArchived = changes.isArchived;

    const doc = await this.updateScopedById(userId, id, { $set: set });
    return doc ? this.toDomain(doc) : null;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    return this.deleteScopedById(userId, id);
  }

  async findMany(userId: string, query: CategoryQuery = {}): Promise<readonly Category[]> {
    const filter = this.buildQueryFilter(userId, query);
    const docs = await this.model.find(filter).sort({ name: 1 }).exec();
    return this.mapMany(docs);
  }

  async findByIds(userId: string, ids: readonly string[]): Promise<readonly Category[]> {
    if (ids.length === 0) return [];

    const objectIds = ids
      .map((id) => this.toObjectId(id))
      .filter((id): id is Types.ObjectId => id !== null);

    if (objectIds.length === 0) return [];

    const docs = await this.model
      .find(this.scopedFilter(userId, { _id: { $in: objectIds } } as FilterQuery<CategoryEntity>))
      .exec();

    return this.mapMany(docs);
  }

  async findByName(
    userId: string,
    flow: Flow,
    kind: CategoryKind,
    name: string,
  ): Promise<Category | null> {
    const trimmed = name.trim();
    if (!trimmed) return null;

    const doc = await this.model
      .findOne(
        this.scopedFilter(userId, {
          flow,
          kind,
          isArchived: false,
          name: { $regex: new RegExp(`^${escapeRegex(trimmed)}$`, 'i') },
        } as FilterQuery<CategoryEntity>),
      )
      .exec();

    return doc ? this.toDomain(doc) : null;
  }

  private buildQueryFilter(userId: string, query: CategoryQuery): FilterQuery<CategoryEntity> {
    const filter: FilterQuery<CategoryEntity> = this.scopedFilter(userId);

    if (query.flow) filter.flow = query.flow;
    if (query.kind) filter.kind = query.kind;
    if (!query.includeArchived) filter.isArchived = false;

    return filter;
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
