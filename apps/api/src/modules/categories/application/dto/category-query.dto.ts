import { CategoryKind, Flow } from '@finance/shared';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class ListCategoriesQueryDto {
  @IsOptional()
  @IsEnum(Flow)
  flow?: Flow;

  @IsOptional()
  @IsEnum(CategoryKind)
  kind?: CategoryKind;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeArchived?: boolean;
}
