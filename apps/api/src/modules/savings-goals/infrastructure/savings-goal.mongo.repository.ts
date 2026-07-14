import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type HydratedDocument, type Model } from 'mongoose';
import type { SavingsGoal } from '@finance/shared';

import { MongoBaseRepository } from '../../../common/database/base.repository';
import { DomainValidationException } from '../../../common/exceptions/app.exception';
import type {
  CreateSavingsGoalData,
  SavingsGoalRepositoryPort,
  UpdateSavingsGoalData,
} from '../domain/savings-goal.repository.port';
import { toSavingsGoal } from './savings-goal.mapper';
import { SavingsGoalEntity } from './savings-goal.schema';

@Injectable()
export class SavingsGoalMongoRepository
  extends MongoBaseRepository<SavingsGoalEntity, SavingsGoal>
  implements SavingsGoalRepositoryPort
{
  constructor(@InjectModel(SavingsGoalEntity.name) model: Model<SavingsGoalEntity>) {
    super(model);
  }

  protected toDomain(doc: HydratedDocument<SavingsGoalEntity>): SavingsGoal {
    return toSavingsGoal(doc);
  }

  async create(data: CreateSavingsGoalData): Promise<SavingsGoal> {
    const userObjectId = this.toObjectId(data.userId);
    if (!userObjectId) throw new DomainValidationException('Invalid user context');

    const doc = await this.insertOne({
      userId: userObjectId,
      name: data.name.trim(),
      template: data.template,
      targetAmount: { ...data.targetAmount },
      currentAmount: { ...data.currentAmount },
      targetDate: data.targetDate,
      notes: data.notes,
    });

    return this.toDomain(doc);
  }

  async findById(userId: string, id: string): Promise<SavingsGoal | null> {
    const doc = await this.findScopedById(userId, id);
    return doc ? this.toDomain(doc) : null;
  }

  async findMany(userId: string): Promise<readonly SavingsGoal[]> {
    const docs = await this.model.find(this.scopedFilter(userId)).sort({ createdAt: -1 }).exec();
    return this.mapMany(docs);
  }

  async update(
    userId: string,
    id: string,
    changes: UpdateSavingsGoalData,
  ): Promise<SavingsGoal | null> {
    const set: Record<string, unknown> = {};
    if (changes.name !== undefined) set.name = changes.name.trim();
    if (changes.template !== undefined) set.template = changes.template;
    if (changes.targetAmount !== undefined) set.targetAmount = { ...changes.targetAmount };
    if (changes.currentAmount !== undefined) set.currentAmount = { ...changes.currentAmount };
    if (changes.targetDate !== undefined) set.targetDate = changes.targetDate;
    if (changes.notes !== undefined) set.notes = changes.notes;

    const doc = await this.updateScopedById(userId, id, { $set: set });
    return doc ? this.toDomain(doc) : null;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    return this.deleteScopedById(userId, id);
  }
}
