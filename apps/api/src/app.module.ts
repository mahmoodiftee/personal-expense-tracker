import { type MiddlewareConsumer, Module, type NestModule, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AppConfigModule } from './config/config.module';
import { LoggerModule } from './core/logger/logger.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './modules/health/health.module';
import { IncomeModule } from './modules/income/income.module';
import { FixedExpensesModule } from './modules/fixed-expenses/fixed-expenses.module';
import { VariableExpensesModule } from './modules/variable-expenses/variable-expenses.module';
import { SavingsModule } from './modules/savings/savings.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { SavingsGoalsModule } from './modules/savings-goals/savings-goals.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { TenantMiddleware } from './core/tenancy/tenant.middleware';
import { validationExceptionFactory } from './common/validation/validation-exception.factory';

/**
 * Application root. Composes the core infrastructure (config, logging, database,
 * health) and registers the cross-cutting HTTP concerns globally:
 *  - `ValidationPipe`      strict DTO validation → structured errors
 *  - `AllExceptionsFilter` uniform error envelope
 *  - `LoggingInterceptor`  per-request access logs
 *  - `ResponseInterceptor` uniform success envelope
 *
 * Feature modules (transactions, categories, …) are added here as they land.
 */
@Module({
  imports: [
    AppConfigModule,
    LoggerModule,
    DatabaseModule,
    HealthModule,
    IncomeModule,
    FixedExpensesModule,
    VariableExpensesModule,
    SavingsModule,
    DashboardModule,
    AnalyticsModule,
    CategoriesModule,
    SavingsGoalsModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: false },
        exceptionFactory: validationExceptionFactory,
      }),
    },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    // Registration order = execution order for the request phase.
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // RequestId first (correlation), then Tenant (resolves userId) for all routes.
    consumer.apply(RequestIdMiddleware, TenantMiddleware).forRoutes('*');
  }
}
