import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CategoryKind, CurrencyCode } from '@finance/shared';

/**
 * Embedded value-object schemas reused across collections. All are declared
 * with `_id: false` because value objects have no identity of their own.
 */

/** Persisted form of the {@link Money} value object (integer minor units). */
@Schema({ _id: false })
export class MoneyEmbeddable {
  @Prop({ type: Number, required: true, min: 0 })
  amountMinor!: number;

  @Prop({ type: String, enum: CurrencyCode, required: true })
  currency!: CurrencyCode;
}
export const MoneySchema = SchemaFactory.createForClass(MoneyEmbeddable);

/**
 * Signed money — allows negative values (e.g. net/remaining balances on a
 * statement). Kept separate from {@link MoneyEmbeddable} so transaction amounts
 * stay non-negative by construction.
 */
@Schema({ _id: false })
export class SignedMoneyEmbeddable {
  @Prop({ type: Number, required: true })
  amountMinor!: number;

  @Prop({ type: String, enum: CurrencyCode, required: true })
  currency!: CurrencyCode;
}
export const SignedMoneySchema = SchemaFactory.createForClass(SignedMoneyEmbeddable);

/** Denormalised category display fields embedded on transactions. */
@Schema({ _id: false })
export class CategorySnapshotEmbeddable {
  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: String, required: true })
  color!: string;

  @Prop({ type: String, required: true })
  icon!: string;

  @Prop({ type: String, enum: CategoryKind, required: true })
  kind!: CategoryKind;
}
export const CategorySnapshotSchema = SchemaFactory.createForClass(CategorySnapshotEmbeddable);
