import { z } from 'zod';

/**
 * Environment schema. The single authority on what configuration the API needs.
 * Validation runs once at boot (fail-fast) so a misconfigured deploy never
 * starts serving traffic in a broken state.
 */
export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),

    // Comma-separated allow-list of browser origins for CORS.
    CORS_ORIGINS: z.string().default('http://localhost:3000'),

    API_GLOBAL_PREFIX: z.string().min(1).default('api'),
    API_DEFAULT_VERSION: z.string().min(1).default('1'),

    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
    MONGODB_DB_NAME: z.string().min(1).default('finance'),

    // Single-user mode: the tenant id used until multi-user auth lands.
    // Must be a valid 24-char hex ObjectId.
    SINGLE_USER_ID: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'SINGLE_USER_ID must be a 24-char hex ObjectId')
      .default('000000000000000000000001'),

    // Auth (phase 1.5) — required in production; optional in development.
    JWT_ACCESS_SECRET: z.string().min(1).optional(),
    JWT_REFRESH_SECRET: z.string().min(1).optional(),
    JWT_ACCESS_TTL: z.string().default('15m'),
    JWT_REFRESH_TTL: z.string().default('7d'),

    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'verbose']).default('info'),

    // AI (phase 2) — blank until enabled.
    AI_PROVIDER: z.string().optional(),
    AI_API_KEY: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== 'production') return;

    if (!env.JWT_ACCESS_SECRET || env.JWT_ACCESS_SECRET.startsWith('replace-me')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'JWT_ACCESS_SECRET must be set to a strong secret in production',
        path: ['JWT_ACCESS_SECRET'],
      });
    }
    if (!env.JWT_REFRESH_SECRET || env.JWT_REFRESH_SECRET.startsWith('replace-me')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'JWT_REFRESH_SECRET must be set to a strong secret in production',
        path: ['JWT_REFRESH_SECRET'],
      });
    }
  });

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validator wired into `@nestjs/config`. Aggregates all issues into a single
 * readable error rather than failing on the first one.
 */
export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}
