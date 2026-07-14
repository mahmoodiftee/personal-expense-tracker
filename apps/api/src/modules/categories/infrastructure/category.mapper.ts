import type { Category } from '@finance/shared';
import type { HydratedDocument } from 'mongoose';

import type { CategoryEntity } from './category.schema';

export function toCategory(doc: HydratedDocument<CategoryEntity>): Category {
  const timestamps = doc as { createdAt?: Date; updatedAt?: Date };
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    name: doc.name,
    flow: doc.flow,
    kind: doc.kind,
    color: doc.color,
    icon: doc.icon,
    isArchived: doc.isArchived,
    createdAt: timestamps.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: timestamps.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}
