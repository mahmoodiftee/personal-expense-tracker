import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CategoryKind, Flow } from '@finance/shared';

export type CategoryDocument = HydratedDocument<CategoryEntity>;

@Schema({ collection: 'categories', timestamps: true })
export class CategoryEntity {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  name!: string;

  @Prop({ type: String, enum: Flow, required: true })
  flow!: Flow;

  @Prop({ type: String, enum: CategoryKind, required: true })
  kind!: CategoryKind;

  @Prop({ type: String, required: true, default: '#64748b' })
  color!: string;

  @Prop({ type: String, required: true, default: 'tag' })
  icon!: string;

  @Prop({ type: Boolean, required: true, default: false })
  isArchived!: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(CategoryEntity);

// Primary access path: list a user's active categories by flow/kind.
CategorySchema.index({ userId: 1, flow: 1, kind: 1, isArchived: 1 });
// Prevent duplicate category names per user within the same flow.
CategorySchema.index({ userId: 1, flow: 1, name: 1 }, { unique: true });
