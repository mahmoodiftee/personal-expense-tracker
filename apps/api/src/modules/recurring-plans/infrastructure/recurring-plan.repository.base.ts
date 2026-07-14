import { type FilterQuery, type Model } from 'mongoose';
import {
  type Cadence,
  type Money,
  type MonthKey,
  RecurringKind,
  RecurringStatus,
} from '@finance/shared';
import { MongoBaseRepository } from '../../../common/database/base.repository';
import { DomainValidationException } from '../../../common/exceptions/app.exception';
import { previousMonthKey } from '../../../common/util/month.util';
import { RecurringPlanEntity } from './recurring-plan.schema';

/** Structural create input shared by all recurring-plan kinds. */
export interface CreateRecurringPlanInput {
  readonly userId: string;
  readonly name: string;
  readonly amount: Money;
  readonly cadence: Cadence;
  readonly dueDay: number;
  readonly startMonth: MonthKey;
  readonly endMonth?: MonthKey | null;
  readonly categoryId?: string | null;
}

/** Mutable metadata common to all recurring-plan kinds. */
export interface UpdateRecurringPlanMeta {
  readonly name?: string;
  readonly dueDay?: number;
  readonly status?: RecurringStatus;
  readonly endMonth?: MonthKey | null;
  readonly categoryId?: string | null;
}

export interface RecurringPlanFilter {
  readonly status?: RecurringStatus;
}

/**
 * Generic Mongoose repository for the shared `recurringPlans` collection,
 * pinned to a single {@link RecurringKind}. Encapsulates all plan persistence
 * (create, effective-dated amount edits, active-window queries) so feature
 * repositories (income, fixed expenses) add only their domain mapping (DRY,
 * Open/Closed). Subclasses implement {@link toDomain} and their port interface.
 */
export abstract class RecurringPlanRepositoryBase<TEntity> extends MongoBaseRepository<
  RecurringPlanEntity,
  TEntity
> {
  protected constructor(
    model: Model<RecurringPlanEntity>,
    private readonly kind: RecurringKind,
  ) {
    super(model);
  }

  /** Every query is scoped to this tenant and this plan kind. */
  private kindFilter(
    userId: string,
    extra: FilterQuery<RecurringPlanEntity> = {},
  ): FilterQuery<RecurringPlanEntity> {
    return this.scopedFilter(userId, { kind: this.kind, ...extra });
  }

  async create(data: CreateRecurringPlanInput): Promise<TEntity> {
    const userObjectId = this.toObjectId(data.userId);
    if (!userObjectId) throw new DomainValidationException('Invalid user context');

    const doc = await this.insertOne({
      userId: userObjectId,
      kind: this.kind,
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

  async findById(userId: string, id: string): Promise<TEntity | null> {
    const objectId = this.toObjectId(id);
    if (!objectId) return null;
    const doc = await this.model.findOne(this.kindFilter(userId, { _id: objectId })).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findMany(userId: string, query?: RecurringPlanFilter): Promise<TEntity[]> {
    const filter = this.kindFilter(userId, query?.status ? { status: query.status } : {});
    const docs = await this.model.find(filter).sort({ createdAt: -1 }).exec();
    return this.mapMany(docs);
  }

  async findActiveInMonth(userId: string, monthKey: MonthKey): Promise<TEntity[]> {
    const filter = this.kindFilter(userId, {
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
    changes: UpdateRecurringPlanMeta,
  ): Promise<TEntity | null> {
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
      .findOneAndUpdate(this.kindFilter(userId, { _id: objectId }), { $set: set }, { new: true })
      .exec();
    return doc ? this.toDomain(doc) : null;
  }

  async appendAmount(
    userId: string,
    id: string,
    amount: Money,
    effectiveFrom: MonthKey,
  ): Promise<TEntity | null> {
    const objectId = this.toObjectId(id);
    if (!objectId) return null;

    const doc = await this.model.findOne(this.kindFilter(userId, { _id: objectId })).exec();
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
    const result = await this.model.deleteOne(this.kindFilter(userId, { _id: objectId })).exec();
    return result.deletedCount === 1;
  }
}
