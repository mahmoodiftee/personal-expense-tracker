import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { Category } from '@finance/shared';

import { CurrentUserId } from '../../../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../../../common/pipes/parse-object-id.pipe';
import { CategoryService } from '../application/category.service';
import { ListCategoriesQueryDto } from '../application/dto/category-query.dto';
import { CreateCategoryDto } from '../application/dto/create-category.dto';
import { UpdateCategoryDto } from '../application/dto/update-category.dto';

@Controller({ path: 'categories', version: '1' })
export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createCategory(
    @CurrentUserId() userId: string,
    @Body() dto: CreateCategoryDto,
  ): Promise<Category> {
    return this.service.createCategory(userId, dto);
  }

  @Get()
  listCategories(
    @CurrentUserId() userId: string,
    @Query() query: ListCategoriesQueryDto,
  ): Promise<readonly Category[]> {
    return this.service.listCategories(userId, query);
  }

  @Get(':id')
  getCategory(
    @CurrentUserId() userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<Category> {
    return this.service.getCategory(userId, id);
  }

  @Patch(':id')
  updateCategory(
    @CurrentUserId() userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.service.updateCategory(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteCategory(
    @CurrentUserId() userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<{ id: string; deleted: true }> {
    await this.service.deleteCategory(userId, id);
    return { id, deleted: true };
  }
}
