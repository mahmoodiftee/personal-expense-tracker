import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { InsightSeverity, InsightType } from '@finance/shared';

export type InsightDocument = HydratedDocument<InsightEntity>;

@Schema({ collection: 'insights', timestamps: true })
export class InsightEntity {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, enum: InsightType, required: true })
  type!: InsightType;

  @Prop({ type: String, enum: InsightSeverity, required: true })
  severity!: InsightSeverity;

  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: String, required: true })
  message!: string;

  @Prop({ type: Object, default: null })
  data!: Record<string, unknown> | null;

  @Prop({ type: String, default: null }) // monthKey YYYY-MM or null (global)
  monthKey!: string | null;

  @Prop({ type: Date, required: true, default: () => new Date() })
  generatedAt!: Date;
}

export const InsightSchema = SchemaFactory.createForClass(InsightEntity);

// List a user's recent insights, optionally scoped to a month.
InsightSchema.index({ userId: 1, monthKey: 1, generatedAt: -1 });
