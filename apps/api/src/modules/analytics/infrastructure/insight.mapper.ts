import type { Insight } from '@finance/shared';
import type { HydratedDocument } from 'mongoose';

import type { InsightEntity } from './insight.schema';

export function toInsight(doc: HydratedDocument<InsightEntity>): Insight {
  const timestamps = doc as { createdAt?: Date; updatedAt?: Date };
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    type: doc.type,
    severity: doc.severity,
    title: doc.title,
    message: doc.message,
    data: doc.data ?? undefined,
    monthKey: doc.monthKey,
    generatedAt: doc.generatedAt.toISOString(),
    createdAt: timestamps.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: timestamps.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}
