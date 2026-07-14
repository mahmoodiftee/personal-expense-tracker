import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type FilterQuery, type HydratedDocument, type Model } from 'mongoose';
import type { CategoryBudget, MonthKey } from '@finance/shared';

import { MongoBaseRepository } from '../../../common/database/base.repository';
import { DomainValidationException } from '../../../common/exceptions/app.exception';
import type {
  CategoryBudgetRepositoryPort,
  CreateCategoryBudgetData,
  UpdateCategoryBudgetData,
} from '../domain/category-budget.repository.port';
import { toCategoryBudget } from './category-budget.mapper';
import { CategoryBudgetEntity } from './category-budget.schema';

@Injectable()
export class CategoryBudgetMongoRepository
  extends MongoBaseRepository<CategoryBudgetEntity, CategoryBudget>
  implements CategoryBudgetRepositoryPort
{
  constructor(@InjectModel(CategoryBudgetEntity.name) model: Model<CategoryBudgetEntity>) {
    super(model);
  }

  protected toDomain(doc: HydratedDocument<CategoryBudgetEntity>): CategoryBudget {
    return toCategoryBudget(doc);
  }

  async create(data: CreateCategoryBudgetData): Promise<CategoryBudget> {
    const userObjectId = this.toObjectId(data.userId);
    const categoryObjectId = this.toObjectId(data.categoryId);
    if (!userObjectId || !categoryObjectId) {
      throw new DomainValidationException('Invalid user or category id');
    }

    const doc = await this.insertOne({
      userId: userObjectId,
      categoryId: categoryObjectId,
      monthKey: data.monthKey,
      limitAmount: { ...data.limitAmount },
    });

    return this.toDomain(doc);
  }

  async findById(userId: string, id: string): Promise<CategoryBudget | null> {
    const doc = await this.findScopedById(userId, id);
    return doc ? this.toDomain(doc) : null;
  }

  async findByMonth(userId: string, monthKey: MonthKey): Promise<readonly CategoryBudget[]> {
    const docs = await this.model
      .find(this.scopedFilter(userId, { monthKey } as FilterQuery<CategoryBudgetEntity>))
      .sort({ createdAt: -1 })
      .exec();
    return this.mapMany(docs);
  }

  async findByCategoryAndMonth(
    userId: string,
    categoryId: string,
    monthKey: MonthKey,
  ): Promise<CategoryBudget | null> {
    const userObjectId = this.toObjectId(userId);
    const categoryObjectId = this.toObjectId(categoryId);
    if (!userObjectId || !categoryObjectId) return null;

    const doc = await this.model
      .findOne({ userId: userObjectId, categoryId: categoryObjectId, monthKey })
      .exec();

    return doc ? this.toDomain(doc) : null;
  }

  async update(
    userId: string,
    id: string,
    changes: UpdateCategoryBudgetData,
  ): Promise<CategoryBudget | null> {
    const set: Record<string, unknown> = {};
    if (changes.limitAmount !== undefined) set.limitAmount = { ...changes.limitAmount };

    const doc = await this.updateScopedById(userId, id, { $set: set });
    return doc ? this.toDomain(doc) : null;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    return this.deleteScopedById(userId, id);
  }
}
