import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CurrencyCode } from '@finance/shared';

@Schema({ _id: false })
export class UserPreferencesEmbeddable {
  @Prop({ type: String, default: 'en-US' })
  locale!: string;

  @Prop({ type: Number, default: 1, min: 1, max: 28 })
  monthStartDay!: number;

  @Prop({ type: String, enum: ['dark', 'light', 'system'], default: 'dark' })
  theme!: 'dark' | 'light' | 'system';
}
export const UserPreferencesSchema = SchemaFactory.createForClass(UserPreferencesEmbeddable);

export type UserDocument = HydratedDocument<UserEntity>;

@Schema({ collection: 'users', timestamps: true })
export class UserEntity {
  @Prop({ type: String, required: true, unique: true, lowercase: true, trim: true, index: true })
  email!: string;

  @Prop({ type: String, required: true, select: false })
  passwordHash!: string;

  @Prop({ type: String, required: true, trim: true })
  displayName!: string;

  @Prop({ type: String, enum: CurrencyCode, required: true, default: CurrencyCode.USD })
  baseCurrency!: CurrencyCode;

  @Prop({ type: UserPreferencesSchema, default: () => ({}) })
  preferences!: UserPreferencesEmbeddable;
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);

// Unique login lookup (also enforces account uniqueness).
UserSchema.index({ email: 1 }, { unique: true });
