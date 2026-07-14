import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  type HealthCheckResult,
  MongooseHealthIndicator,
} from '@nestjs/terminus';

/**
 * Health probes for orchestrators and uptime monitors.
 * - `GET /health`       readiness (includes a MongoDB ping)
 * - `GET /health/live`  liveness (process is up; no dependencies checked)
 *
 * Version-neutral so probe URLs stay stable across API versions.
 */
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongoose: MongooseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  readiness(): Promise<HealthCheckResult> {
    return this.health.check([() => this.mongoose.pingCheck('mongodb', { timeout: 3000 })]);
  }

  @Get('live')
  @HealthCheck()
  liveness(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }
}
