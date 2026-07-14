import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

/**
 * Inline ("dynamic") category descriptor for a variable expense. Persisted as a
 * denormalised snapshot; `color`/`icon` fall back to sensible defaults.
 */
export class CategoryInputDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name!: string;

  @IsOptional()
  @Matches(/^#([0-9a-fA-F]{6})$/, { message: 'color must be a hex value like #64748b' })
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  icon?: string;
}
