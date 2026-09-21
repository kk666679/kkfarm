import { z } from 'zod';

export const WorkloadEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // Redis — no default; must be set explicitly via environment or vault
  REDIS_URL: z.string().url('REDIS_URL must be a valid URL').optional(),

  WORKLOAD_MANAGER_HOST: z.string().default('0.0.0.0'),
  WORKLOAD_MANAGER_PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  JOB_QUEUE_CONCURRENCY: z.coerce.number().int().positive().default(10),

  VAULT_ADDR: z.string().url().optional(),
  VAULT_TOKEN: z.string().optional(),
  VAULT_MOUNT: z.string().default('secret'),
});

export type WorkloadEnvConfig = z.output<typeof WorkloadEnvSchema>;

export interface WorkloadConfig {
  redis: {
    url: string | undefined;
  };
  server: {
    host: string;
    port: number;
  };
  queue: {
    concurrency: number;
  };
}

export function loadWorkloadEnv(env: Record<string, string | undefined> = process.env): {
  env: WorkloadEnvConfig;
  config: WorkloadConfig;
} {
  const result = WorkloadEnvSchema.safeParse(env);
  if (!result.success) {
    const errors = result.error.issues
      .map(e => `  ${e.path.join('.') || 'root'}: ${e.message}`)
      .join('\n');
    throw new Error(`[WorkloadManager] Environment validation failed:\n${errors}`);
  }

  const parsed = result.data;

  const config: WorkloadConfig = {
    redis: { url: parsed.REDIS_URL },
    server: {
      host: parsed.WORKLOAD_MANAGER_HOST,
      port: parsed.WORKLOAD_MANAGER_PORT,
    },
    queue: {
      concurrency: parsed.JOB_QUEUE_CONCURRENCY,
    },
  };

  if (parsed.NODE_ENV === 'production' && !config.redis.url) {
    throw new Error('[WorkloadManager] REDIS_URL is required in production');
  }

  return { env: parsed, config };
}
