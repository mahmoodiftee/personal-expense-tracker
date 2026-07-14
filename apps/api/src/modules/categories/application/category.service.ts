import { Inject, Injectable } from '@nestjs/common';
import type { Category } from '@finance/shared';

import { AppLogger } from '../../../core/logger/app-logger.service';
import {
  ResourceConflictException,
  ResourceNotFoundException,
} from '../../../common/exceptions/app.exception';
import {
  CATEGORY_REPOSITORY,
  type CategoryQuery,
  type CategoryRepositoryPort,
} from '../domain/category.repository.port';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { ListCategoriesQueryDto } from './dto/category-query.dto';
import type { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categories: CategoryRepositoryPort,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(CategoryService.name);
  }

  async createCategory(userId: string, dto: CreateCategoryDto): Promise<Category> {
    try {
      const category = await this.categories.create({
        userId,
        name: dto.name,
        flow: dto.flow,
        kind: dto.kind,
        color: dto.color,
        icon: dto.icon,
      });

      this.logger.log(`Category created: ${category.id} (${category.name}) [user ${userId}]`);
      return category;
    } catch (error) {
      this.rethrowDuplicate(error, dto.name);
      throw error;
    }
  }

  listCategories(userId: string, query: ListCategoriesQueryDto): Promise<readonly Category[]> {
    const repoQuery: CategoryQuery = {
      flow: query.flow,
      kind: query.kind,
      includeArchived: query.includeArchived,
    };
    return this.categories.findMany(userId, repoQuery);
  }

  async getCategory(userId: string, id: string): Promise<Category> {
    const category = await this.categories.findById(userId, id);
    if (!category) throw new ResourceNotFoundException('Category', id);
    return category;
  }

  async updateCategory(userId: string, id: string, dto: UpdateCategoryDto): Promise<Category> {
    try {
      const updated = await this.categories.update(userId, id, dto);
      if (!updated) throw new ResourceNotFoundException('Category', id);

      this.logger.log(`Category updated: ${id} [user ${userId}]`);
      return updated;
    } catch (error) {
      if (dto.name) this.rethrowDuplicate(error, dto.name);
      throw error;
    }
  }

  async deleteCategory(userId: string, id: string): Promise<void> {
    const existing = await this.categories.findById(userId, id);
    if (!existing) throw new ResourceNotFoundException('Category', id);

    const deleted = await this.categories.delete(userId, id);
    if (!deleted) throw new ResourceNotFoundException('Category', id);

    this.logger.log(`Category deleted: ${id} [user ${userId}]`);
  }

  private rethrowDuplicate(error: unknown, name: string): void {
    if (this.isDuplicateKeyError(error)) {
      throw new ResourceConflictException(`Category "${name}" already exists for this flow`);
    }
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: number }).code === 11000
    );
  }
}
