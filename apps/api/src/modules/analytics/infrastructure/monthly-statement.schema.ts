import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CurrencyCode, ForecastMethod } from '@finance/shared';
import {
  MoneyEmbeddable,
  MoneySchema,
  SignedMoneyEmbeddable,
  SignedMoneySchema,
} from '../../../common/database/embedded.schemas';

@Schema({ _id: false })
export class StatementTotalsEmbeddable {
  @Prop({ type: MoneySchema, required: true }) income!: MoneyEmbeddable;
  @Prop({ type: MoneySchema, required: true }) fixedExpense!: MoneyEmbeddable;
  @Prop({ type: MoneySchema, required: true }) variableExpense!: MoneyEmbeddable;
  @Prop({ type: MoneySchema, required: true }) totalExpense!: MoneyEmbeddable;
  @Prop({ type: SignedMoneySchema, required: true }) remaining!: SignedMoneyEmbeddable;
}
export const StatementTotalsSchema = SchemaFactory.createForClass(StatementTotalsEmbeddable);

@Schema({ _id: false })
export class StatementSavingsEmbeddable {
  @Prop({ type: SignedMoneySchema, required: true }) amount!: SignedMoneyEmbeddable;
  @Prop({ type: Number, required: true }) ratePct!: number;
}
export const StatementSavingsSchema = SchemaFactory.createForClass(StatementSavingsEmbeddable);

@Schema({ _id: false })
export class StatementBreakdownItemEmbeddable {
  @Prop({ type: Types.ObjectId, required: true }) categoryId!: Types.ObjectId;
  @Prop({ type: String, required: true }) name!: string;
  @Prop({ type: MoneySchema, required: true }) total!: MoneyEmbeddable;
  @Prop({ type: Number, required: true }) sharePct!: number;
}
export const StatementBreakdownItemSchema = SchemaFactory.createForClass(
  StatementBreakdownItemEmbeddable,
);

@Schema({ _id: false })
export class SavingsForecastEmbeddable {
  @Prop({ type: SignedMoneySchema, required: true }) projectedSavings!: SignedMoneyEmbeddable;
  @Prop({ type: String, enum: ForecastMethod, required: true }) method!: ForecastMethod;
  @Prop({ type: Number, required: true, min: 0, max: 100 }) confidencePct!: number;
}
export const SavingsForecastSchema = SchemaFactory.createForClass(SavingsForecastEmbeddable);

export type MonthlyStatementDocument = HydratedDocument<MonthlyStatementEntity>;

@Schema({ collection: 'monthlyStatements', timestamps: true })
export class MonthlyStatementEntity {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, required: true }) // monthKey YYYY-MM
  monthKey!: string;

  @Prop({ type: String, enum: CurrencyCode, required: true })
  currency!: CurrencyCode;

  @Prop({ type: StatementTotalsSchema, required: true })
  totals!: StatementTotalsEmbeddable;

  @Prop({ type: StatementSavingsSchema, required: true })
  savings!: StatementSavingsEmbeddable;

  @Prop({ type: [StatementBreakdownItemSchema], default: [] })
  categoryBreakdown!: StatementBreakdownItemEmbeddable[];

  @Prop({ type: SavingsForecastSchema, default: null })
  forecast!: SavingsForecastEmbeddable | null;

  @Prop({ type: Date, required: true, default: () => new Date() })
  computedAt!: Date;

  @Prop({ type: Number, required: true, default: 1 })
  version!: number;
}

export const MonthlyStatementSchema = SchemaFactory.createForClass(MonthlyStatementEntity);

// One statement per user per month; also the upsert target and history sort key.
MonthlyStatementSchema.index({ userId: 1, monthKey: -1 }, { unique: true });
