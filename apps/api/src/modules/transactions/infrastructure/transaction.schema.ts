import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Flow } from '@finance/shared';
import {
  CategorySnapshotEmbeddable,
  CategorySnapshotSchema,
  MoneyEmbeddable,
  MoneySchema,
} from '../../../common/database/embedded.schemas';

export type TransactionDocument = HydratedDocument<TransactionEntity>;

@Schema({ collection: 'transactions', timestamps: true })
export class TransactionEntity {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, enum: Flow, required: true })
  flow!: Flow;

  @Prop({ type: MoneySchema, required: true })
  amount!: MoneyEmbeddable;

  @Prop({ type: Types.ObjectId, required: true })
  categoryId!: Types.ObjectId;

  @Prop({ type: CategorySnapshotSchema, required: true })
  categorySnapshot!: CategorySnapshotEmbeddable;

  @Prop({ type: Types.ObjectId, default: null })
  recurringPlanId!: Types.ObjectId | null;

  @Prop({ type: String, required: true, trim: true })
  description!: string;

  @Prop({ type: String, default: null })
  notes!: string | null;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: Date, required: true })
  occurredAt!: Date;

  @Prop({ type: String, required: true }) // monthKey YYYY-MM (derived on write)
  monthKey!: string;
}

export const TransactionSchema = SchemaFactory.createForClass(TransactionEntity);

// Primary feed: a user's transactions newest-first.
TransactionSchema.index({ userId: 1, occurredAt: -1 });
// Monthly rollup aggregation (index-covered).
TransactionSchema.index({ userId: 1, monthKey: 1, flow: 1 });
// Per-category trend analysis.
TransactionSchema.index({ userId: 1, categoryId: 1, monthKey: 1 });
// Reconcile materialised recurring occurrences (sparse via partial filter).
TransactionSchema.index(
  { userId: 1, recurringPlanId: 1, monthKey: 1 },
  { partialFilterExpression: { recurringPlanId: { $type: 'objectId' } } },
);
// Tag filtering.
TransactionSchema.index({ userId: 1, tags: 1 });
