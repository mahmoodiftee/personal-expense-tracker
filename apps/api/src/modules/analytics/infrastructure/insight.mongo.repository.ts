import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type FilterQuery, type HydratedDocument, type Model, Types } from 'mongoose';
import type { Insight, MonthKey } from '@finance/shared';

import { DomainValidationException } from '../../../common/exceptions/app.exception';
import type {
  CreateInsightData,
  InsightQuery,
  InsightRepositoryPort,
} from '../domain/insight.repository.port';
import { toInsight } from './insight.mapper';
import { InsightEntity } from './insight.schema';

@Injectable()
export class InsightMongoRepository implements InsightRepositoryPort {
  constructor(@InjectModel(InsightEntity.name) private readonly model: Model<InsightEntity>) {}

  async create(data: CreateInsightData): Promise<Insight> {
    const userObjectId = this.toObjectId(data.userId);
    if (!userObjectId) throw new DomainValidationException('Invalid user context');

    const doc = await this.model.create({
      userId: userObjectId,
      type: data.type,
      severity: data.severity,
      title: data.title,
      message: data.message,
      data: data.data ?? null,
      monthKey: data.monthKey ?? null,
      generatedAt: new Date(),
    });

    return toInsight(doc);
  }

  async createMany(data: readonly CreateInsightData[]): Promise<readonly Insight[]> {
    if (data.length === 0) return [];

    const docs = await this.model.insertMany(
      data.map((item) => {
        const userObjectId = this.toObjectId(item.userId);
        if (!userObjectId) throw new DomainValidationException('Invalid user context');
        return {
          userId: userObjectId,
          type: item.type,
          severity: item.severity,
          title: item.title,
          message: item.message,
          data: item.data ?? null,
          monthKey: item.monthKey ?? null,
          generatedAt: new Date(),
        };
      }),
    );

    return docs.map((doc) => toInsight(doc as HydratedDocument<InsightEntity>));
  }

  async findMany(userId: string, query: InsightQuery = {}): Promise<readonly Insight[]> {
    const userObjectId = this.toObjectId(userId);
    if (!userObjectId) return [];

    const filter: FilterQuery<InsightEntity> = { userId: userObjectId };
    if (query.monthKey) filter.monthKey = query.monthKey;

    const limit = Math.min(Math.max(query.limit ?? 50, 1), 100);

    const docs = await this.model.find(filter).sort({ generatedAt: -1 }).limit(limit).exec();

    return docs.map((doc) => toInsight(doc));
  }

  async deleteByMonth(userId: string, monthKey: MonthKey): Promise<number> {
    const userObjectId = this.toObjectId(userId);
    if (!userObjectId) return 0;

    const result = await this.model.deleteMany({ userId: userObjectId, monthKey }).exec();
    return result.deletedCount ?? 0;
  }

  private toObjectId(id: string): Types.ObjectId | null {
    return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;
  }
}
