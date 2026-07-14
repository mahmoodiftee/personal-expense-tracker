import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CATEGORY_REPOSITORY } from './domain/category.repository.port';
import { CategoryService } from './application/category.service';
import { CATEGORY_MODEL } from './infrastructure/category.model';
import { CategoryMongoRepository } from './infrastructure/category.mongo.repository';
import { CategoryController } from './presentation/category.controller';

@Module({
  imports: [MongooseModule.forFeature([CATEGORY_MODEL])],
  controllers: [CategoryController],
  providers: [CategoryService, { provide: CATEGORY_REPOSITORY, useClass: CategoryMongoRepository }],
  exports: [CategoryService, CATEGORY_REPOSITORY],
})
export class CategoriesModule {}
