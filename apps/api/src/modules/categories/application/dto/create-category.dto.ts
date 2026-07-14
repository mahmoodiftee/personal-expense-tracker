import { CategoryKind, Flow } from '@finance/shared';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name!: string;

  @IsEnum(Flow)
  flow!: Flow;

  @IsEnum(CategoryKind)
  kind!: CategoryKind;

  @IsOptional()
  @Matches(/^#([0-9a-fA-F]{6})$/, { message: 'color must be a hex value like #64748b' })
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  icon?: string;
}
