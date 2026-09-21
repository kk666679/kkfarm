import { z } from 'zod';
export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  LOG_FORMAT: z.enum(['json', 'pretty']).default('json'),
  DEFAULT_REGION: z.string().default('singapore'),
  SUPPORTED_REGIONS: z.string().default('singapore,tokyo,london,frankfurt,virginia'),
  // Auth
  JWT_SECRET: z.string().min(32).optional(),
  JWT_EXPIRES_IN: z.string().default('8h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  OAUTH_ISSUER: z.string().url().optional(),
  OAUTH_CLIENT_ID: z.string().optional(),
  OAUTH_CLIENT_SECRET: z.string().optional(),
  // Observability
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
  OTEL_SERVICE_NAME: z.string().default('smart-device-cloud'),
  // Vault
  VAULT_ADDR: z.string().url().optional(),
  VAULT_TOKEN: z.string().optional(),
  VAULT_MOUNT: z.string().default('secret'),
  // Feature flags
  FEATURE_FLEET_INTELLIGENCE: z.coerce.boolean().default(true),
  FEATURE_WORKFLOW_AUTOMATION: z.coerce.boolean().default(true),
  FEATURE_COST_MANAGEMENT: z.coerce.boolean().default(true),
});
export class EnvValidationError extends Error {
  errors;
  constructor(errors) {
    const msg = errors.map(e => `${e.path}: ${e.message}`).join(', ');
    super(`Environment validation failed: ${msg}`);
    this.errors = errors;
    this.name = 'EnvValidationError';
  }
}
export function validateEnv(env = typeof process !== 'undefined' ? process.env : {}) {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    const errors = result.error.issues.map(e => ({
      path: e.path.join('.') || 'root',
      message: e.message,
    }));
    throw new EnvValidationError(errors);
  }
  return result.data;
}
export const config = validateEnv();
//# sourceMappingURL=env.js.map
