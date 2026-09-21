import { z } from 'zod';
export declare const EnvSchema: z.ZodObject<
  {
    NODE_ENV: z.ZodDefault<
      z.ZodEnum<{
        development: 'development';
        production: 'production';
        test: 'test';
      }>
    >;
    LOG_LEVEL: z.ZodDefault<
      z.ZodEnum<{
        error: 'error';
        info: 'info';
        fatal: 'fatal';
        warn: 'warn';
        debug: 'debug';
        trace: 'trace';
      }>
    >;
    LOG_FORMAT: z.ZodDefault<
      z.ZodEnum<{
        json: 'json';
        pretty: 'pretty';
      }>
    >;
    DEFAULT_REGION: z.ZodDefault<z.ZodString>;
    SUPPORTED_REGIONS: z.ZodDefault<z.ZodString>;
    JWT_SECRET: z.ZodOptional<z.ZodString>;
    JWT_EXPIRES_IN: z.ZodDefault<z.ZodString>;
    JWT_REFRESH_EXPIRES_IN: z.ZodDefault<z.ZodString>;
    OAUTH_ISSUER: z.ZodOptional<z.ZodString>;
    OAUTH_CLIENT_ID: z.ZodOptional<z.ZodString>;
    OAUTH_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
    OTEL_EXPORTER_OTLP_ENDPOINT: z.ZodOptional<z.ZodString>;
    OTEL_SERVICE_NAME: z.ZodDefault<z.ZodString>;
    VAULT_ADDR: z.ZodOptional<z.ZodString>;
    VAULT_TOKEN: z.ZodOptional<z.ZodString>;
    VAULT_MOUNT: z.ZodDefault<z.ZodString>;
    FEATURE_FLEET_INTELLIGENCE: z.ZodDefault<z.ZodCoercedBoolean<unknown>>;
    FEATURE_WORKFLOW_AUTOMATION: z.ZodDefault<z.ZodCoercedBoolean<unknown>>;
    FEATURE_COST_MANAGEMENT: z.ZodDefault<z.ZodCoercedBoolean<unknown>>;
  },
  z.core.$strip
>;
export type EnvSchemaInput = z.input<typeof EnvSchema>;
export type EnvConfig = z.output<typeof EnvSchema>;
export declare class EnvValidationError extends Error {
  readonly errors: {
    path: string;
    message: string;
  }[];
  constructor(
    errors: {
      path: string;
      message: string;
    }[]
  );
}
export declare function validateEnv(env?: Record<string, string | undefined>): EnvConfig;
export declare const config: {
  NODE_ENV: 'development' | 'production' | 'test';
  LOG_LEVEL: 'error' | 'info' | 'fatal' | 'warn' | 'debug' | 'trace';
  LOG_FORMAT: 'json' | 'pretty';
  DEFAULT_REGION: string;
  SUPPORTED_REGIONS: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  OTEL_SERVICE_NAME: string;
  VAULT_MOUNT: string;
  FEATURE_FLEET_INTELLIGENCE: boolean;
  FEATURE_WORKFLOW_AUTOMATION: boolean;
  FEATURE_COST_MANAGEMENT: boolean;
  JWT_SECRET?: string | undefined;
  OAUTH_ISSUER?: string | undefined;
  OAUTH_CLIENT_ID?: string | undefined;
  OAUTH_CLIENT_SECRET?: string | undefined;
  OTEL_EXPORTER_OTLP_ENDPOINT?: string | undefined;
  VAULT_ADDR?: string | undefined;
  VAULT_TOKEN?: string | undefined;
};
//# sourceMappingURL=env.d.ts.map
