import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type HydratedDocument, type Model, Types } from 'mongoose';
import type { MonthKey } from '@finance/shared';
import { DomainValidationException } from '../../../common/exceptions/app.exception';
import type {
  ExpensePaymentRecord,
  ExpensePaymentRepositoryPort,
  UpsertPaymentData,
} from '../domain/expense-payment.repository.port';
import { FixedExpensePaymentEntity } from './expense-payment.schema';

type PaymentDoc = HydratedDocument<FixedExpensePaymentEntity>;

/**
 * Mongoose adapter for fixed-expense payment status. Upserts are keyed on
 * (userId, planId, monthKey) so marking paid/unpaid repeatedly is idempotent.
 */
@Injectable()
export class ExpensePaymentMongoRepository implements ExpensePaymentRepositoryPort {
  constructor(
    @InjectModel(FixedExpensePaymentEntity.name)
    private readonly model: Model<FixedExpensePaymentEntity>,
  ) {}

  private toObjectId(id: string): Types.ObjectId | null {
    return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;
  }

  private toDomain(doc: PaymentDoc): ExpensePaymentRecord {
    return {
      planId: doc.planId.toString(),
      monthKey: doc.monthKey,
      status: doc.status,
      amount: { amountMinor: doc.amount.amountMinor, currency: doc.amount.currency },
      paidAt: doc.paidAt ? doc.paidAt.toISOString() : null,
    };
  }

  async upsert(data: UpsertPaymentData): Promise<ExpensePaymentRecord> {
    const userObjectId = this.toObjectId(data.userId);
    const planObjectId = this.toObjectId(data.planId);
    if (!userObjectId || !planObjectId) {
      throw new DomainValidationException('Invalid user or plan context');
    }

    const doc = await this.model
      .findOneAndUpdate(
        {
          userId: userObjectId,
          planId: planObjectId,
          monthKey: data.monthKey,
        },
        {
          $set: {
            status: data.status,
            amount: { amountMinor: data.amount.amountMinor, currency: data.amount.currency },
            paidAt: data.paidAt ? new Date(data.paidAt) : null,
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      )
      .exec();
    return this.toDomain(doc);
  }

  async findByMonth(userId: string, monthKey: MonthKey): Promise<readonly ExpensePaymentRecord[]> {
    const userObjectId = this.toObjectId(userId);
    if (!userObjectId) return [];
    const docs = await this.model.find({ userId: userObjectId, monthKey }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findRange(
    userId: string,
    from: MonthKey,
    to: MonthKey,
  ): Promise<readonly ExpensePaymentRecord[]> {
    const userObjectId = this.toObjectId(userId);
    if (!userObjectId) return [];
    const docs = await this.model
      .find({ userId: userObjectId, monthKey: { $gte: from, $lte: to } })
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async deleteForPlan(userId: string, planId: string): Promise<number> {
    const userObjectId = this.toObjectId(userId);
    const planObjectId = this.toObjectId(planId);
    if (!userObjectId || !planObjectId) return 0;
    const result = await this.model
      .deleteMany({ userId: userObjectId, planId: planObjectId })
      .exec();
    return result.deletedCount ?? 0;
  }
}
