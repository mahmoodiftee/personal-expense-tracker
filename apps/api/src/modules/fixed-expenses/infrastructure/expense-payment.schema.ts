import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PaymentStatus } from '@finance/shared';
import { MoneyEmbeddable, MoneySchema } from '../../../common/database/embedded.schemas';

export type FixedExpensePaymentDocument = HydratedDocument<FixedExpensePaymentEntity>;

/**
 * Monthly payment-status record for a fixed expense. One document per
 * (userId, planId, monthKey). Its presence with `status = PAID` marks the bill
 * as paid for that month; `amount` snapshots the due amount at that time.
 */
@Schema({ collection: 'fixedExpensePayments', timestamps: true })
export class FixedExpensePaymentEntity {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  planId!: Types.ObjectId;

  @Prop({ type: String, required: true }) // monthKey YYYY-MM
  monthKey!: string;

  @Prop({ type: String, enum: PaymentStatus, required: true })
  status!: PaymentStatus;

  @Prop({ type: MoneySchema, required: true })
  amount!: MoneyEmbeddable;

  @Prop({ type: Date, default: null })
  paidAt!: Date | null;
}

export const FixedExpensePaymentSchema = SchemaFactory.createForClass(FixedExpensePaymentEntity);

// One status record per plan per month; also the upsert target.
FixedExpensePaymentSchema.index({ userId: 1, planId: 1, monthKey: 1 }, { unique: true });
// Fetch all statuses for a month / range.
FixedExpensePaymentSchema.index({ userId: 1, monthKey: 1 });

export const FIXED_EXPENSE_PAYMENT_MODEL = {
  name: FixedExpensePaymentEntity.name,
  schema: FixedExpensePaymentSchema,
};
