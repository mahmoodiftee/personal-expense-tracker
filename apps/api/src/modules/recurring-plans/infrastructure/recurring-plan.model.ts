import { RecurringPlanEntity, RecurringPlanSchema } from './recurring-plan.schema';

/**
 * Mongoose feature-registration tuple for the shared `recurringPlans`
 * collection. Imported by every module that persists recurring plans (income,
 * fixed expenses) so the schema is declared identically in one place.
 */
export const RECURRING_PLAN_MODEL = {
  name: RecurringPlanEntity.name,
  schema: RecurringPlanSchema,
};
