import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type FilterQuery, type HydratedDocument, type Model } from 'mongoose';
import {
  type IncomeSource,
  type Money,
  type MonthKey,
  RecurringKind,
  RecurringStatus,
} from '@finance/shared';
import { MongoBaseRepository } from '../../../common/database/base.repository';
import { DomainValidationException } from '../../../common/exceptions/app.exception';
import { previousMonthKey } from '../../../common/util/month.util';
import {
  RecurringPlanEntity,
  RecurringPlanSchema,
} from '../../recurring-plans/infrastructure/recurring-plan.schema';
import type {
  CreateIncomeSourceData,
  IncomeSourceQuery,
  IncomeSourceRepositoryPort,
  UpdateIncomeSourceData,
} from '../domain/income-source.repository.port';
import { toIncomeSource } from './income-source.mapper';

/** Schema registration tuple for this collection (used by the module). */
export const RECURRING_PLAN_MODEL = { name: RecurringPlanEntity.name, schema: RecurringPlanSchema };

type RecurringPlanDoc = HydratedDocument<RecurringPlanEntity>;

/**
 * Mongoose adapter for income sources. Persists to the shared `recurringPlans`
 * collection, always constraining reads/writes to `kind = INCOME` so this
 * module can never touch fixed-expense plans.
 */
@Injectable()
export class IncomeSourceMongoRepository
  extends MongoBaseRepository<RecurringPlanEntity, IncomeSource>
  implements IncomeSourceRepositoryPort
{
  constructor(@InjectModel(RecurringPlanEntity.name) model: Model<RecurringPlanEntity>) {
    super(model);
  }

  protected toDomain(doc: RecurringPlanDoc): IncomeSource {
    return toIncomeSource(doc);
  }

  /** Base filter pinning every query to this tenant's income sources. */
  private incomeFilter(
    userId: string,
    extra: FilterQuery<RecurringPlanEntity> = {},
  ): FilterQuery<RecurringPlanEntity> {
    return this.scopedFilter(userId, { kind: RecurringKind.INCOME, ...extra });
  }

  async create(data: CreateIncomeSourceData): Promise<IncomeSource> {
    const userObjectId = this.toObjectId(data.userId);
    if (!userObjectId) {
      throw new DomainValidationException('Invalid user context');
    }

    const doc = await this.insertOne({
      userId: userObjectId,
      kind: RecurringKind.INCOME,
      categoryId: data.categoryId ? this.toObjectId(data.categoryId) : null,
      name: data.name,
      amountHistory: [
        {
          amount: { amountMinor: data.amount.amountMinor, currency: data.amount.currency },
          effectiveFrom: data.startMonth,
          effectiveTo: null,
        },
      ],
      cadence: data.cadence,
      dueDay: data.dueDay,
      status: RecurringStatus.ACTIVE,
      startMonth: data.startMonth,
      endMonth: data.endMonth ?? null,
      autoPost: false,
    });

    return this.toDomain(doc);
  }

  async findById(userId: string, id: string): Promise<IncomeSource | null> {
    const objectId = this.toObjectId(id);
    if (!objectId) return null;
    const doc = await this.model.findOne(this.incomeFilter(userId, { _id: objectId })).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findMany(userId: string, query?: IncomeSourceQuery): Promise<readonly IncomeSource[]> {
    const filter = this.incomeFilter(userId, query?.status ? { status: query.status } : {});
    const docs = await this.model.find(filter).sort({ createdAt: -1 }).exec();
    return this.mapMany(docs);
  }

  async findActiveInMonth(userId: string, monthKey: MonthKey): Promise<readonly IncomeSource[]> {
    const filter = this.incomeFilter(userId, {
      status: RecurringStatus.ACTIVE,
      startMonth: { $lte: monthKey },
      $or: [{ endMonth: null }, { endMonth: { $gte: monthKey } }],
    });
    const docs = await this.model.find(filter).exec();
    return this.mapMany(docs);
  }

  async updateMeta(
    userId: string,
    id: string,
    changes: UpdateIncomeSourceData,
  ): Promise<IncomeSource | null> {
    const objectId = this.toObjectId(id);
    if (!objectId) return null;

    const set: Record<string, unknown> = {};
    if (changes.name !== undefined) set.name = changes.name;
    if (changes.dueDay !== undefined) set.dueDay = changes.dueDay;
    if (changes.status !== undefined) set.status = changes.status;
    if (changes.endMonth !== undefined) set.endMonth = changes.endMonth;
    if (changes.categoryId !== undefined) {
      set.categoryId = changes.categoryId ? this.toObjectId(changes.categoryId) : null;
    }

    const doc = await this.model
      .findOneAndUpdate(this.incomeFilter(userId, { _id: objectId }), { $set: set }, { new: true })
      .exec();
    return doc ? this.toDomain(doc) : null;
  }

  async appendAmount(
    userId: string,
    id: string,
    amount: Money,
    effectiveFrom: MonthKey,
  ): Promise<IncomeSource | null> {
    const objectId = this.toObjectId(id);
    if (!objectId) return null;

    const doc = await this.model.findOne(this.incomeFilter(userId, { _id: objectId })).exec();
    if (!doc) return null;

    const openPeriod = doc.amountHistory.find((period) => period.effectiveTo === null);
    if (openPeriod) {
      if (effectiveFrom <= openPeriod.effectiveFrom) {
        throw new DomainValidationException(
          'New amount effective month must be after the current amount period',
        );
      }
      openPeriod.effectiveTo = previousMonthKey(effectiveFrom);
    }

    doc.amountHistory.push({
      amount: { amountMinor: amount.amountMinor, currency: amount.currency },
      effectiveFrom,
      effectiveTo: null,
    });
    doc.markModified('amountHistory');
    await doc.save();

    return this.toDomain(doc);
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const objectId = this.toObjectId(id);
    if (!objectId) return false;
    const result = await this.model.deleteOne(this.incomeFilter(userId, { _id: objectId })).exec();
    return result.deletedCount === 1;
  }
}
