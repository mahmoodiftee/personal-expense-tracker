/**
 * Seeds demo financial data for local development. Idempotent unless --force
 * is passed (which clears existing data for the configured user first).
 *
 * Usage (from apps/api):
 *   pnpm db:seed
 *   pnpm db:seed -- --force
 */
import mongoose, { Types } from 'mongoose';
import {
  Cadence,
  CategoryKind,
  CurrencyCode,
  Flow,
  PaymentStatus,
  RecurringKind,
  RecurringStatus,
  SavingsGoalTemplate,
} from '@finance/shared';

import { CategorySchema } from '../modules/categories/infrastructure/category.schema';
import { RecurringPlanSchema } from '../modules/recurring-plans/infrastructure/recurring-plan.schema';
import { TransactionSchema } from '../modules/transactions/infrastructure/transaction.schema';
import { FixedExpensePaymentSchema } from '../modules/fixed-expenses/infrastructure/expense-payment.schema';
import { SavingsGoalSchema } from '../modules/savings-goals/infrastructure/savings-goal.schema';
import { CategoryBudgetSchema } from '../modules/budgets/infrastructure/category-budget.schema';
import { currentMonthKey, shiftMonthKey } from '../common/util/month.util';

const USD = CurrencyCode.USD;
const force = process.argv.includes('--force');

function money(amountMajor: number) {
  return { amountMinor: Math.round(amountMajor * 100), currency: USD };
}

function monthDate(monthKey: string, day: number): Date {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(Date.UTC(year!, month! - 1, day));
}

async function clearUserData(db: mongoose.mongo.Db, userId: Types.ObjectId): Promise<void> {
  const filter = { userId };
  await Promise.all([
    db.collection('categories').deleteMany(filter),
    db.collection('recurringPlans').deleteMany(filter),
    db.collection('transactions').deleteMany(filter),
    db.collection('fixedExpensePayments').deleteMany(filter),
    db.collection('savingsGoals').deleteMany(filter),
    db.collection('categoryBudgets').deleteMany(filter),
    db.collection('insights').deleteMany(filter),
  ]);
}

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME ?? 'finance';
  const userIdHex = process.env.SINGLE_USER_ID ?? '000000000000000000000001';

  if (!uri) {
    console.error('MONGODB_URI is not set. Run from apps/api with .env loaded.');
    process.exit(1);
  }

  const userId = new Types.ObjectId(userIdHex);
  const month = currentMonthKey();
  const historyStart = shiftMonthKey(month, -5);

  console.log(`Connecting to MongoDB (database: ${dbName})…`);
  await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 15_000 });
  const db = mongoose.connection.db;
  if (!db) throw new Error('No database handle after connect');

  const Category = mongoose.connection.model('categories', CategorySchema, 'categories');
  const RecurringPlan = mongoose.connection.model(
    'recurringPlans',
    RecurringPlanSchema,
    'recurringPlans',
  );
  const Transaction = mongoose.connection.model('transactions', TransactionSchema, 'transactions');
  const FixedExpensePayment = mongoose.connection.model(
    'fixedExpensePayments',
    FixedExpensePaymentSchema,
    'fixedExpensePayments',
  );
  const SavingsGoal = mongoose.connection.model('savingsGoals', SavingsGoalSchema, 'savingsGoals');
  const CategoryBudget = mongoose.connection.model(
    'categoryBudgets',
    CategoryBudgetSchema,
    'categoryBudgets',
  );

  const existing = await Transaction.countDocuments({ userId });
  if (existing > 0 && !force) {
    console.log(`Seed skipped: ${existing} transactions already exist for user ${userIdHex}.`);
    console.log('Run with --force to replace demo data.');
    await mongoose.disconnect();
    return;
  }

  if (existing > 0 && force) {
    console.log('Clearing existing data…');
    await clearUserData(db, userId);
  }

  console.log(`Seeding demo data for user ${userIdHex} (${historyStart} → ${month})…`);

  const categoryDocs = await Category.insertMany([
    {
      userId,
      name: 'Groceries',
      flow: Flow.EXPENSE,
      kind: CategoryKind.VARIABLE,
      color: '#22c55e',
      icon: 'shopping-cart',
      isArchived: false,
    },
    {
      userId,
      name: 'Dining',
      flow: Flow.EXPENSE,
      kind: CategoryKind.VARIABLE,
      color: '#f97316',
      icon: 'utensils',
      isArchived: false,
    },
    {
      userId,
      name: 'Transport',
      flow: Flow.EXPENSE,
      kind: CategoryKind.VARIABLE,
      color: '#3b82f6',
      icon: 'car',
      isArchived: false,
    },
    {
      userId,
      name: 'Housing',
      flow: Flow.EXPENSE,
      kind: CategoryKind.FIXED,
      color: '#8b5cf6',
      icon: 'home',
      isArchived: false,
    },
  ]);
  const groceries = categoryDocs[0]!;
  const dining = categoryDocs[1]!;
  const transport = categoryDocs[2]!;
  const housing = categoryDocs[3]!;

  const planBase = {
    userId,
    cadence: Cadence.MONTHLY,
    status: RecurringStatus.ACTIVE,
    startMonth: historyStart,
    endMonth: null,
    autoPost: false,
  };

  const planDocs = await RecurringPlan.insertMany([
    {
      ...planBase,
      kind: RecurringKind.INCOME,
      categoryId: null,
      name: 'Salary',
      dueDay: 1,
      amountHistory: [{ amount: money(5500), effectiveFrom: historyStart, effectiveTo: null }],
    },
    {
      ...planBase,
      kind: RecurringKind.FIXED_EXPENSE,
      categoryId: housing._id,
      name: 'Rent',
      dueDay: 1,
      amountHistory: [{ amount: money(1800), effectiveFrom: historyStart, effectiveTo: null }],
    },
    {
      ...planBase,
      kind: RecurringKind.FIXED_EXPENSE,
      categoryId: null,
      name: 'Internet',
      dueDay: 5,
      amountHistory: [{ amount: money(80), effectiveFrom: historyStart, effectiveTo: null }],
    },
    {
      ...planBase,
      kind: RecurringKind.FIXED_EXPENSE,
      categoryId: null,
      name: 'Insurance',
      dueDay: 15,
      amountHistory: [{ amount: money(120), effectiveFrom: historyStart, effectiveTo: null }],
    },
  ]);
  const salary = planDocs[0]!;
  const rent = planDocs[1]!;
  const internet = planDocs[2]!;
  const insurance = planDocs[3]!;

  const variableByMonth: Record<string, { groceries: number; dining: number; transport: number }> =
    {
      [shiftMonthKey(month, -5)]: { groceries: 450, dining: 200, transport: 120 },
      [shiftMonthKey(month, -4)]: { groceries: 520, dining: 180, transport: 100 },
      [shiftMonthKey(month, -3)]: { groceries: 480, dining: 250, transport: 130 },
      [shiftMonthKey(month, -2)]: { groceries: 600, dining: 220, transport: 110 },
      [shiftMonthKey(month, -1)]: { groceries: 550, dining: 300, transport: 95 },
      [month]: { groceries: 510, dining: 280, transport: 140 },
    };

  const expenseRows: Array<Record<string, unknown>> = [];

  for (const [monthKey, amounts] of Object.entries(variableByMonth)) {
    const entries = [
      { category: groceries, amount: amounts.groceries, description: 'Weekly groceries' },
      { category: dining, amount: amounts.dining, description: 'Restaurants & cafes' },
      { category: transport, amount: amounts.transport, description: 'Transit & fuel' },
    ];

    entries.forEach(({ category, amount, description }, index) => {
      expenseRows.push({
        userId,
        flow: Flow.EXPENSE,
        amount: money(amount),
        categoryId: category._id,
        categorySnapshot: {
          name: category.name,
          color: category.color,
          icon: category.icon,
          kind: category.kind,
        },
        recurringPlanId: null,
        description,
        notes: null,
        tags: index === 0 ? ['essentials'] : [],
        occurredAt: monthDate(monthKey, 10 + index * 5),
        monthKey,
      });
    });
  }

  await Transaction.insertMany(expenseRows);

  await FixedExpensePayment.insertMany([
    {
      userId,
      planId: rent._id,
      monthKey: month,
      status: PaymentStatus.PAID,
      amount: money(1800),
      paidAt: monthDate(month, 1),
    },
    {
      userId,
      planId: internet._id,
      monthKey: month,
      status: PaymentStatus.PAID,
      amount: money(80),
      paidAt: monthDate(month, 5),
    },
    {
      userId,
      planId: insurance._id,
      monthKey: month,
      status: PaymentStatus.UNPAID,
      amount: money(120),
      paidAt: null,
    },
  ]);

  await SavingsGoal.insertMany([
    {
      userId,
      name: 'Emergency fund',
      template: SavingsGoalTemplate.EMERGENCY_FUND,
      targetAmount: money(10000),
      currentAmount: money(3200),
      targetDate: monthDate(shiftMonthKey(month, 6), 1),
      notes: 'Six months of essential expenses',
    },
    {
      userId,
      name: 'Summer vacation',
      template: SavingsGoalTemplate.VACATION,
      targetAmount: money(3000),
      currentAmount: money(850),
      targetDate: monthDate(shiftMonthKey(month, 4), 1),
      notes: null,
    },
  ]);

  await CategoryBudget.insertMany([
    {
      userId,
      categoryId: groceries._id,
      monthKey: month,
      limitAmount: money(600),
    },
    {
      userId,
      categoryId: dining._id,
      monthKey: month,
      limitAmount: money(350),
    },
    {
      userId,
      categoryId: transport._id,
      monthKey: month,
      limitAmount: money(150),
    },
  ]);

  console.log('\nSeed complete.');
  console.table([
    { item: 'Income sources', count: 1, detail: `Salary ($5,500/mo) — ${salary._id}` },
    { item: 'Fixed expenses', count: 3, detail: 'Rent, Internet, Insurance' },
    { item: 'Variable expenses', count: expenseRows.length, detail: `${historyStart} → ${month}` },
    { item: 'Savings goals', count: 2, detail: 'Emergency fund, Vacation' },
    { item: 'Budgets', count: 3, detail: `For ${month}` },
  ]);
  console.log(`\nRefresh http://localhost:3000/dashboard — data is scoped to user ${userIdHex}.`);

  await mongoose.disconnect();
}

main().catch((error: unknown) => {
  console.error('Seed failed:', error);
  void mongoose.disconnect();
  process.exit(1);
});
