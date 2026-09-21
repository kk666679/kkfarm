import { z } from 'zod';

export const AnalyticsEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // Redis — no default; must be set via environment
  REDIS_URL: z.string().url('REDIS_URL must be a valid URL').optional(),

  // PostgreSQL — no default; must be set via environment
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL').optional(),

  // TimescaleDB — host, port, user, password, db all required in production
  TIMESERIES_HOST: z.string().optional(),
  TIMESERIES_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  TIMESERIES_USER: z.string().optional(),
  TIMESERIES_PASSWORD: z.string().optional(),
  TIMESERIES_DB: z.string().optional(),

  ANALYTICS_SERVICE_HOST: z.string().default('0.0.0.0'),
  ANALYTICS_SERVICE_PORT: z.coerce.number().int().min(1).max(65535).default(3002),
  ANALYTICS_BATCH_SIZE: z.coerce.number().int().positive().default(100),
  ANALYTICS_FLUSH_INTERVAL_MS: z.coerce.number().int().positive().default(300000),
  ANALYTICS_AGGREGATION_INTERVAL: z.coerce.number().int().positive().default(300000),

  VAULT_ADDR: z.string().url().optional(),
  VAULT_TOKEN: z.string().optional(),
  VAULT_MOUNT: z.string().default('secret'),
});

export type AnalyticsEnvConfig = z.output<typeof AnalyticsEnvSchema>;

export interface AnalyticsConfig {
  redis: { url: string | undefined };
  postgres: { connectionString: string | undefined };
  timeseries: {
    host: string | undefined;
    port: number | undefined;
    user: string | undefined;
    password: string | undefined;
    database: string | undefined;
  };
  server: {
    host: string;
    port: number;
  };
  batch: {
    size: number;
    flushIntervalMs: number;
    aggregationIntervalMs: number;
  };
}

export function loadAnalyticsEnv(env: Record<string, string | undefined> = process.env): {
  env: AnalyticsEnvConfig;
  config: AnalyticsConfig;
} {
  const result = AnalyticsEnvSchema.safeParse(env);
  if (!result.success) {
    const errors = result.error.issues
      .map(e => `  ${e.path.join('.') || 'root'}: ${e.message}`)
      .join('\n');
    throw new Error(`[AnalyticsService] Environment validation failed:\n${errors}`);
  }

  const parsed = result.data;

  const config: AnalyticsConfig = {
    redis: { url: parsed.REDIS_URL },
    postgres: { connectionString: parsed.DATABASE_URL },
    timeseries: {
      host: parsed.TIMESERIES_HOST,
      port: parsed.TIMESERIES_PORT,
      user: parsed.TIMESERIES_USER,
      password: parsed.TIMESERIES_PASSWORD,
      database: parsed.TIMESERIES_DB,
    },
    server: {
      host: parsed.ANALYTICS_SERVICE_HOST,
      port: parsed.ANALYTICS_SERVICE_PORT,
    },
    batch: {
      size: parsed.ANALYTICS_BATCH_SIZE,
      flushIntervalMs: parsed.ANALYTICS_FLUSH_INTERVAL_MS,
      aggregationIntervalMs: parsed.ANALYTICS_AGGREGATION_INTERVAL,
    },
  };

  if (
    parsed.NODE_ENV === 'production' &&
    (!config.redis.url || !config.postgres.connectionString)
  ) {
    throw new Error('[AnalyticsService] REDIS_URL and DATABASE_URL are required in production');
  }

  return { env: parsed, config };
}
