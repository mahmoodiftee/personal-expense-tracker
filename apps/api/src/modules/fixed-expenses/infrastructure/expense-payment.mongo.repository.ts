import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type HydratedDocument, type Model, Types } from 'mongoose';
import type { MonthKey } from '@finance/shared';
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

  private toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
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
    const doc = await this.model
      .findOneAndUpdate(
        {
          userId: this.toObjectId(data.userId),
          planId: this.toObjectId(data.planId),
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
    const docs = await this.model.find({ userId: this.toObjectId(userId), monthKey }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findRange(
    userId: string,
    from: MonthKey,
    to: MonthKey,
  ): Promise<readonly ExpensePaymentRecord[]> {
    const docs = await this.model
      .find({ userId: this.toObjectId(userId), monthKey: { $gte: from, $lte: to } })
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async deleteForPlan(userId: string, planId: string): Promise<number> {
    const result = await this.model
      .deleteMany({ userId: this.toObjectId(userId), planId: this.toObjectId(planId) })
      .exec();
    return result.deletedCount ?? 0;
  }
}
