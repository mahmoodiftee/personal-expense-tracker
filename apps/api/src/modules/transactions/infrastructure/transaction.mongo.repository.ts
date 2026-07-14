import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type FilterQuery, type HydratedDocument, type Model, Types } from 'mongoose';
import { CurrencyCode, Flow, type Money, type MonthKey, type Transaction } from '@finance/shared';
import { MongoBaseRepository } from '../../../common/database/base.repository';
import {
  MAX_PAGE_SIZE,
  type CursorPagination,
  type Paginated,
} from '../../../common/domain/pagination';
import { monthKeyFromDate } from '../../../common/util/month.util';
import { DomainValidationException } from '../../../common/exceptions/app.exception';
import type {
  CategoryAggregate,
  CreateTransactionData,
  FlowTotal,
  TransactionFilter,
  TransactionRepositoryPort,
  UpdateTransactionData,
} from '../domain/transaction.repository.port';
import { TransactionEntity } from './transaction.schema';
import { toTransaction } from './transaction.mapper';

interface DecodedCursor {
  readonly occurredAt: Date;
  readonly id: Types.ObjectId;
}

/**
 * Mongoose adapter for the transactions ledger. Owns all query construction,
 * cursor pagination, and aggregation for the shared `transactions` collection.
 * Consumers depend on {@link TransactionRepositoryPort}, never on this class.
 */
@Injectable()
export class TransactionMongoRepository
  extends MongoBaseRepository<TransactionEntity, Transaction>
  implements TransactionRepositoryPort
{
  constructor(@InjectModel(TransactionEntity.name) model: Model<TransactionEntity>) {
    super(model);
  }

  protected toDomain(doc: HydratedDocument<TransactionEntity>): Transaction {
    return toTransaction(doc);
  }

  async create(data: CreateTransactionData): Promise<Transaction> {
    const userObjectId = this.toObjectId(data.userId);
    if (!userObjectId) throw new DomainValidationException('Invalid user context');

    const doc = await this.insertOne({
      userId: userObjectId,
      flow: data.flow,
      amount: { amountMinor: data.amount.amountMinor, currency: data.amount.currency },
      categoryId: data.categoryId ? this.toObjectId(data.categoryId) : null,
      categorySnapshot: { ...data.categorySnapshot },
      recurringPlanId: data.recurringPlanId ? this.toObjectId(data.recurringPlanId) : null,
      description: data.description,
      notes: data.notes ?? null,
      tags: data.tags ? [...data.tags] : [],
      occurredAt: data.occurredAt,
      monthKey: monthKeyFromDate(data.occurredAt),
    });

    return this.toDomain(doc);
  }

  async findById(userId: string, id: string): Promise<Transaction | null> {
    const doc = await this.findScopedById(userId, id);
    return doc ? this.toDomain(doc) : null;
  }

  async update(
    userId: string,
    id: string,
    changes: UpdateTransactionData,
  ): Promise<Transaction | null> {
    const set: Record<string, unknown> = {};
    if (changes.amount !== undefined) {
      set.amount = { amountMinor: changes.amount.amountMinor, currency: changes.amount.currency };
    }
    if (changes.categoryId !== undefined) {
      set.categoryId = changes.categoryId ? this.toObjectId(changes.categoryId) : null;
    }
    if (changes.categorySnapshot !== undefined)
      set.categorySnapshot = { ...changes.categorySnapshot };
    if (changes.description !== undefined) set.description = changes.description;
    if (changes.notes !== undefined) set.notes = changes.notes;
    if (changes.tags !== undefined) set.tags = [...changes.tags];
    if (changes.occurredAt !== undefined) {
      set.occurredAt = changes.occurredAt;
      set.monthKey = monthKeyFromDate(changes.occurredAt);
    }

    const doc = await this.updateScopedById(userId, id, { $set: set });
    return doc ? this.toDomain(doc) : null;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    return this.deleteScopedById(userId, id);
  }

  async findManyPaginated(
    userId: string,
    filter: TransactionFilter,
    pagination: CursorPagination,
  ): Promise<Paginated<Transaction>> {
    const baseFilter = this.buildFilter(userId, filter);
    const limit = Math.min(Math.max(pagination.limit, 1), MAX_PAGE_SIZE);

    const cursor = pagination.cursor ? this.decodeCursor(pagination.cursor) : null;
    if (pagination.cursor && !cursor) {
      throw new DomainValidationException('Invalid pagination cursor');
    }
    const cursorClause: FilterQuery<TransactionEntity> | null = cursor
      ? {
          $or: [
            { occurredAt: { $lt: cursor.occurredAt } },
            { occurredAt: cursor.occurredAt, _id: { $lt: cursor.id } },
          ],
        }
      : null;

    const query: FilterQuery<TransactionEntity> = cursorClause
      ? { $and: [baseFilter, cursorClause] }
      : baseFilter;

    const [docs, total] = await Promise.all([
      this.model
        .find(query)
        .sort({ occurredAt: -1, _id: -1 })
        .limit(limit + 1)
        .exec(),
      this.model.countDocuments(baseFilter).exec(),
    ]);

    const hasNextPage = docs.length > limit;
    const pageDocs = hasNextPage ? docs.slice(0, limit) : docs;
    const last = pageDocs[pageDocs.length - 1];

    return {
      items: this.mapMany(pageDocs),
      total,
      page: 1,
      limit,
      hasNextPage,
      nextCursor: hasNextPage && last ? this.encodeCursor(last) : undefined,
    };
  }

  async sumByFlowForMonth(userId: string, monthKey: MonthKey): Promise<readonly FlowTotal[]> {
    const userObjectId = this.toObjectId(userId);
    if (!userObjectId) return [];

    const rows = await this.model
      .aggregate<{ _id: Flow; totalMinor: number; currency: CurrencyCode; count: number }>([
        {
          $match: {
            userId: userObjectId,
            monthKey,
            $or: [{ flow: { $ne: Flow.EXPENSE } }, this.adHocExpenseClause()],
          },
        },
        {
          $group: {
            _id: '$flow',
            totalMinor: { $sum: '$amount.amountMinor' },
            currency: { $first: '$amount.currency' },
            count: { $sum: 1 },
          },
        },
      ])
      .exec();

    return rows.map((row) => ({
      flow: row._id,
      total: { amountMinor: row.totalMinor, currency: row.currency ?? CurrencyCode.USD },
      transactionCount: row.count,
    }));
  }

  async sumByFlowGroupedByMonth(
    userId: string,
    from: MonthKey,
    to: MonthKey,
    flow: Flow,
  ): Promise<Map<MonthKey, Money>> {
    const userObjectId = this.toObjectId(userId);
    if (!userObjectId) return new Map();

    const rows = await this.model
      .aggregate<{ _id: MonthKey; totalMinor: number; currency: CurrencyCode }>([
        { $match: this.flowRangeMatch(userObjectId, from, to, flow) },
        {
          $group: {
            _id: '$monthKey',
            totalMinor: { $sum: '$amount.amountMinor' },
            currency: { $first: '$amount.currency' },
          },
        },
      ])
      .exec();

    const result = new Map<MonthKey, Money>();
    for (const row of rows) {
      result.set(row._id, {
        amountMinor: row.totalMinor,
        currency: row.currency ?? CurrencyCode.USD,
      });
    }
    return result;
  }

  async breakdownByCategory(
    userId: string,
    monthKey: MonthKey,
    flow: Flow,
  ): Promise<readonly CategoryAggregate[]> {
    const userObjectId = this.toObjectId(userId);
    if (!userObjectId) return [];

    const rows = await this.model
      .aggregate<{
        _id: { id: Types.ObjectId | null; name: string; color: string };
        totalMinor: number;
        currency: CurrencyCode;
        count: number;
      }>([
        { $match: this.flowMonthMatch(userObjectId, monthKey, flow) },
        {
          $group: {
            _id: {
              id: '$categoryId',
              name: '$categorySnapshot.name',
              color: '$categorySnapshot.color',
            },
            totalMinor: { $sum: '$amount.amountMinor' },
            currency: { $first: '$amount.currency' },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalMinor: -1 } },
      ])
      .exec();

    return rows.map((row) => ({
      categoryId: row._id.id ? row._id.id.toString() : '',
      categoryName: row._id.name,
      color: row._id.color,
      total: { amountMinor: row.totalMinor, currency: row.currency ?? CurrencyCode.USD },
      transactionCount: row.count,
    }));
  }

  async breakdownByCategoryGroupedByMonth(
    userId: string,
    from: MonthKey,
    to: MonthKey,
    flow: Flow,
  ): Promise<ReadonlyMap<MonthKey, readonly CategoryAggregate[]>> {
    const userObjectId = this.toObjectId(userId);
    if (!userObjectId) return new Map();

    const rows = await this.model
      .aggregate<{
        _id: {
          monthKey: MonthKey;
          id: Types.ObjectId | null;
          name: string;
          color: string;
        };
        totalMinor: number;
        currency: CurrencyCode;
        count: number;
      }>([
        { $match: this.flowRangeMatch(userObjectId, from, to, flow) },
        {
          $group: {
            _id: {
              monthKey: '$monthKey',
              id: '$categoryId',
              name: '$categorySnapshot.name',
              color: '$categorySnapshot.color',
            },
            totalMinor: { $sum: '$amount.amountMinor' },
            currency: { $first: '$amount.currency' },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalMinor: -1 } },
      ])
      .exec();

    const result = new Map<MonthKey, CategoryAggregate[]>();
    for (const row of rows) {
      const monthKey = row._id.monthKey;
      const aggregate: CategoryAggregate = {
        categoryId: row._id.id ? row._id.id.toString() : '',
        categoryName: row._id.name,
        color: row._id.color,
        total: { amountMinor: row.totalMinor, currency: row.currency ?? CurrencyCode.USD },
        transactionCount: row.count,
      };
      const existing = result.get(monthKey) ?? [];
      existing.push(aggregate);
      result.set(monthKey, existing);
    }
    return result;
  }

  async distinctMonthKeys(userId: string): Promise<readonly MonthKey[]> {
    const userObjectId = this.toObjectId(userId);
    if (!userObjectId) return [];
    const months = await this.model.distinct('monthKey', { userId: userObjectId }).exec();
    return (months as MonthKey[]).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
  }

  private buildFilter(userId: string, filter: TransactionFilter): FilterQuery<TransactionEntity> {
    const query = this.scopedFilter(userId);

    if (filter.flow) query.flow = filter.flow;
    if (filter.monthKey) query.monthKey = filter.monthKey;
    if (filter.categoryId) {
      const categoryId = this.toObjectId(filter.categoryId);
      if (categoryId) query.categoryId = categoryId;
    }
    if (filter.tags && filter.tags.length > 0) query.tags = { $all: [...filter.tags] };

    if (filter.adHocOnly) query.recurringPlanId = null;

    if (filter.from || filter.to) {
      const range: Record<string, Date> = {};
      if (filter.from) range.$gte = filter.from;
      if (filter.to) range.$lte = filter.to;
      query.occurredAt = range;
    }

    if (filter.amountMinMinor != null || filter.amountMaxMinor != null) {
      const range: Record<string, number> = {};
      if (filter.amountMinMinor != null) range.$gte = filter.amountMinMinor;
      if (filter.amountMaxMinor != null) range.$lte = filter.amountMaxMinor;
      query['amount.amountMinor'] = range;
    }

    if (filter.search) {
      const rx = new RegExp(escapeRegExp(filter.search), 'i');
      query.$or = [{ description: rx }, { notes: rx }, { 'categorySnapshot.name': rx }];
    }

    return query;
  }

  /** Variable expenses are ad-hoc ledger rows — exclude materialised recurring plans. */
  private adHocExpenseClause(): FilterQuery<TransactionEntity> {
    return { flow: Flow.EXPENSE, recurringPlanId: null };
  }

  private flowMonthMatch(
    userObjectId: Types.ObjectId,
    monthKey: MonthKey,
    flow: Flow,
  ): FilterQuery<TransactionEntity> {
    const match: FilterQuery<TransactionEntity> = { userId: userObjectId, monthKey, flow };
    if (flow === Flow.EXPENSE) {
      (match as { recurringPlanId: null }).recurringPlanId = null;
    }
    return match;
  }

  private flowRangeMatch(
    userObjectId: Types.ObjectId,
    from: MonthKey,
    to: MonthKey,
    flow: Flow,
  ): FilterQuery<TransactionEntity> {
    const match: FilterQuery<TransactionEntity> = {
      userId: userObjectId,
      monthKey: { $gte: from, $lte: to },
      flow,
    };
    if (flow === Flow.EXPENSE) {
      (match as { recurringPlanId: null }).recurringPlanId = null;
    }
    return match;
  }

  private encodeCursor(doc: HydratedDocument<TransactionEntity>): string {
    const raw = `${doc.occurredAt.getTime()}:${doc._id.toString()}`;
    return Buffer.from(raw, 'utf8').toString('base64url');
  }

  private decodeCursor(cursor: string): DecodedCursor | null {
    try {
      const raw = Buffer.from(cursor, 'base64url').toString('utf8');
      const [ms, id] = raw.split(':');
      if (!ms || !id || !Types.ObjectId.isValid(id)) return null;
      const occurredAt = new Date(Number(ms));
      if (Number.isNaN(occurredAt.getTime())) return null;
      return { occurredAt, id: new Types.ObjectId(id) };
    } catch {
      return null;
    }
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
