import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SavingsGoalTemplate } from '@finance/shared';

import { MoneyEmbeddable, MoneySchema } from '../../../common/database/embedded.schemas';

export type SavingsGoalDocument = HydratedDocument<SavingsGoalEntity>;

@Schema({ collection: 'savingsGoals', timestamps: true })
export class SavingsGoalEntity {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  name!: string;

  @Prop({ type: String, enum: SavingsGoalTemplate, required: true })
  template!: SavingsGoalTemplate;

  @Prop({ type: MoneySchema, required: true })
  targetAmount!: MoneyEmbeddable;

  @Prop({ type: MoneySchema, required: true })
  currentAmount!: MoneyEmbeddable;

  @Prop({ type: Date, default: null })
  targetDate!: Date | null;

  @Prop({ type: String, default: null, maxlength: 2000 })
  notes!: string | null;
}

export const SavingsGoalSchema = SchemaFactory.createForClass(SavingsGoalEntity);

SavingsGoalSchema.index({ userId: 1, createdAt: -1 });
