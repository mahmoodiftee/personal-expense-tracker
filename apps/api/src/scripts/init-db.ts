/**
 * Provisions the MongoDB database: ensures collections exist and syncs indexes
 * from Mongoose schemas. Safe to re-run (idempotent).
 *
 * Usage (from apps/api):
 *   pnpm db:init
 */
import mongoose from 'mongoose';
import { CategorySchema } from '../modules/categories/infrastructure/category.schema';
import { RecurringPlanSchema } from '../modules/recurring-plans/infrastructure/recurring-plan.schema';
import { TransactionSchema } from '../modules/transactions/infrastructure/transaction.schema';
import { FixedExpensePaymentSchema } from '../modules/fixed-expenses/infrastructure/expense-payment.schema';
import { SavingsGoalSchema } from '../modules/savings-goals/infrastructure/savings-goal.schema';
import { CategoryBudgetSchema } from '../modules/budgets/infrastructure/category-budget.schema';
import { InsightSchema } from '../modules/analytics/infrastructure/insight.schema';
import { MonthlyStatementSchema } from '../modules/analytics/infrastructure/monthly-statement.schema';
import { UserSchema } from '../modules/users/infrastructure/user.schema';

const COLLECTIONS = [
  { name: 'categories', schema: CategorySchema },
  { name: 'recurringPlans', schema: RecurringPlanSchema },
  { name: 'transactions', schema: TransactionSchema },
  { name: 'fixedExpensePayments', schema: FixedExpensePaymentSchema },
  { name: 'savingsGoals', schema: SavingsGoalSchema },
  { name: 'categoryBudgets', schema: CategoryBudgetSchema },
  { name: 'insights', schema: InsightSchema },
  { name: 'monthlyStatements', schema: MonthlyStatementSchema },
  { name: 'users', schema: UserSchema },
] as const;

async function ensureCollection(db: mongoose.mongo.Db, name: string): Promise<void> {
  const existing = await db.listCollections({ name }).toArray();
  if (existing.length === 0) {
    await db.createCollection(name);
    console.log(`  created collection: ${name}`);
  } else {
    console.log(`  collection exists: ${name}`);
  }
}

async function syncIndexes(
  connection: mongoose.Connection,
  name: string,
  schema: mongoose.Schema,
): Promise<void> {
  const model = connection.models[name] ?? connection.model(name, schema, name);
  const result = await model.syncIndexes();
  const changed = Object.entries(result).filter(([, action]) => action !== 'same');
  if (changed.length === 0) {
    console.log(`  indexes up to date: ${name}`);
  } else {
    for (const [indexName, action] of changed) {
      console.log(`  index ${action}: ${name}.${indexName}`);
    }
  }
}

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME ?? 'finance';

  if (!uri) {
    console.error('MONGODB_URI is not set. Run from apps/api with .env loaded.');
    process.exit(1);
  }

  console.log(`Connecting to MongoDB (database: ${dbName})…`);
  await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 15_000 });
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('No database handle after connect');
  }

  console.log('\nEnsuring collections…');
  for (const { name } of COLLECTIONS) {
    await ensureCollection(db, name);
  }

  console.log('\nSyncing indexes…');
  for (const { name, schema } of COLLECTIONS) {
    await syncIndexes(mongoose.connection, name, schema);
  }

  const stats = await Promise.all(
    COLLECTIONS.map(async ({ name }) => {
      const count = await db.collection(name).countDocuments();
      return { name, count };
    }),
  );

  console.log('\nDatabase ready.');
  console.table(stats);
  await mongoose.disconnect();
}

main().catch((error: unknown) => {
  console.error('Database init failed:', error);
  void mongoose.disconnect();
  process.exit(1);
});
