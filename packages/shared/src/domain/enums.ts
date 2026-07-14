/**
 * Core domain enumerations shared across the entire platform (API + Web + AI).
 *
 * String enums (not numeric) keep persisted values human-readable in MongoDB
 * and stable across service boundaries — a prerequisite for future
 * microservice extraction and AI consumption.
 */

/** Direction of a financial movement on the ledger. */
export enum Flow {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

/**
 * Whether a category represents a recurring/committed cost (FIXED, e.g. rent)
 * or a discretionary, ad-hoc one (VARIABLE, e.g. groceries).
 */
export enum CategoryKind {
  FIXED = 'FIXED',
  VARIABLE = 'VARIABLE',
}

/** Nature of a recurring plan definition. */
export enum RecurringKind {
  INCOME = 'INCOME',
  FIXED_EXPENSE = 'FIXED_EXPENSE',
}

/** Lifecycle status of a recurring plan. */
export enum RecurringStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ENDED = 'ENDED',
}

/** How often a recurring plan repeats. */
export enum Cadence {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

/** ISO 4217 currency codes supported at launch. Extend as needed. */
export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  BDT = 'BDT',
  INR = 'INR',
}

/** Payment state of a fixed expense for a given month. */
export enum PaymentStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
}

/** Severity of an insight, ordered informational → urgent for UI ranking. */
export enum InsightSeverity {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

/** Category of an insight so AI/UI consumers can route it. */
export enum InsightType {
  BUDGET_OVERRUN = 'BUDGET_OVERRUN',
  SPENDING_SPIKE = 'SPENDING_SPIKE',
  SAVINGS_OPPORTUNITY = 'SAVINGS_OPPORTUNITY',
  RECURRING_DETECTED = 'RECURRING_DETECTED',
  SAVINGS_FORECAST = 'SAVINGS_FORECAST',
  GENERAL = 'GENERAL',
}

/** Algorithm used to produce a savings forecast (recorded for auditability). */
export enum ForecastMethod {
  /** Weighted moving average over the last N months. */
  WMA = 'WMA',
  /** Simple moving average. */
  SMA = 'SMA',
  /** Ordinary least-squares linear regression. */
  LINEAR_REGRESSION = 'LINEAR_REGRESSION',
}

/** Preset templates for common savings goals. */
export enum SavingsGoalTemplate {
  EMERGENCY_FUND = 'EMERGENCY_FUND',
  VACATION = 'VACATION',
  NEW_LAPTOP = 'NEW_LAPTOP',
  HOUSE_FUND = 'HOUSE_FUND',
  CUSTOM = 'CUSTOM',
}
