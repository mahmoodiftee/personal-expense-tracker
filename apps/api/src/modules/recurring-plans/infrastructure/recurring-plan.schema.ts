import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Cadence, RecurringKind, RecurringStatus } from '@finance/shared';
import { MoneyEmbeddable, MoneySchema } from '../../../common/database/embedded.schemas';

/** One effective-dated amount period. Editing appends; history is immutable. */
@Schema({ _id: false })
export class AmountPeriodEmbeddable {
  @Prop({ type: MoneySchema, required: true })
  amount!: MoneyEmbeddable;

  @Prop({ type: String, required: true }) // monthKey YYYY-MM (inclusive)
  effectiveFrom!: string;

  @Prop({ type: String, default: null }) // null = currently active
  effectiveTo!: string | null;
}
export const AmountPeriodSchema = SchemaFactory.createForClass(AmountPeriodEmbeddable);

export type RecurringPlanDocument = HydratedDocument<RecurringPlanEntity>;

@Schema({ collection: 'recurringPlans', timestamps: true })
export class RecurringPlanEntity {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, enum: RecurringKind, required: true })
  kind!: RecurringKind;

  @Prop({ type: Types.ObjectId, required: true })
  categoryId!: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  name!: string;

  @Prop({ type: [AmountPeriodSchema], required: true, default: [] })
  amountHistory!: AmountPeriodEmbeddable[];

  @Prop({ type: String, enum: Cadence, required: true, default: Cadence.MONTHLY })
  cadence!: Cadence;

  @Prop({ type: Number, required: true, min: 1, max: 31, default: 1 })
  dueDay!: number;

  @Prop({ type: String, enum: RecurringStatus, required: true, default: RecurringStatus.ACTIVE })
  status!: RecurringStatus;

  @Prop({ type: String, required: true }) // monthKey YYYY-MM
  startMonth!: string;

  @Prop({ type: String, default: null }) // monthKey or null (open-ended)
  endMonth!: string | null;

  @Prop({ type: Boolean, required: true, default: false })
  autoPost!: boolean;
}

export const RecurringPlanSchema = SchemaFactory.createForClass(RecurringPlanEntity);

// List active plans of a kind (income vs fixed expense) for a user.
RecurringPlanSchema.index({ userId: 1, kind: 1, status: 1 });
// Reconcile plans against their category.
RecurringPlanSchema.index({ userId: 1, categoryId: 1 });
