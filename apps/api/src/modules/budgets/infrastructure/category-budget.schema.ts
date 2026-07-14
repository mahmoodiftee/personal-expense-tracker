import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { MoneyEmbeddable, MoneySchema } from '../../../common/database/embedded.schemas';

export type CategoryBudgetDocument = HydratedDocument<CategoryBudgetEntity>;

@Schema({ collection: 'categoryBudgets', timestamps: true })
export class CategoryBudgetEntity {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  categoryId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  monthKey!: string;

  @Prop({ type: MoneySchema, required: true })
  limitAmount!: MoneyEmbeddable;
}

export const CategoryBudgetSchema = SchemaFactory.createForClass(CategoryBudgetEntity);

CategoryBudgetSchema.index({ userId: 1, monthKey: 1 });
CategoryBudgetSchema.index({ userId: 1, categoryId: 1, monthKey: 1 }, { unique: true });
