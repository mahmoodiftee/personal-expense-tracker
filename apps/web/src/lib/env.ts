import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';

/** Accept either env name; NEXT_PUBLIC_API_BASE_URL is the canonical variable. */
export function readPublicApiBaseUrl(): string | undefined {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL;
  return value?.trim() || undefined;
}

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: isProduction
    ? z
        .string({
          required_error:
            'NEXT_PUBLIC_API_BASE_URL (or NEXT_PUBLIC_API_URL) is required in production',
        })
        .url('NEXT_PUBLIC_API_BASE_URL must be a valid URL')
    : z.string().url().default('http://localhost:4000/api/v1'),
  NEXT_PUBLIC_APP_NAME: z.string().default('Finance'),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: readPublicApiBaseUrl(),
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
});

export type AppEnv = z.infer<typeof envSchema>;
