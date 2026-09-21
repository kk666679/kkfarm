import { z } from 'zod';

const normalizeEmpty = (value: string | undefined): string | undefined => {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

const ConfigSchema = z.object({
  port: z.coerce.number().default(3001),
  host: z.string().default('0.0.0.0'),
  logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  bodyLimit: z.coerce.number().default(10 * 1024 * 1024),

  jwtIssuer: z.string().url().default('https://auth.sdc.dev'),
  jwtAudience: z.string().default('sdc-gateway'),
  jwksUri: z.string().url().default('https://auth.sdc.dev/.well-known/jwks.json'),
  jwtSecret: z.string().min(32).optional(),

  corsOrigins: z.array(z.string().url()),

  telemetryUrl: z.string().url(),
  workloadUrl: z.string().url(),
  analyticsUrl: z.string().url(),
  deviceAgentUrl: z.string().url(),
  billingUrl: z.string().url(),
  autoclawWs: z.string().url(),
  farmsUrl: z.string().url().optional(),

  mcpServers: z.string().transform(s => JSON.parse(s) as Record<string, string>),
  mcpToken: z.string().default(''),

  rateLimitGlobalMax: z.coerce.number().default(1000),
  rateLimitGlobalWindowMs: z.coerce.number().default(60_000),

  otelEndpoint: z.string().url(),
  otelServiceName: z.string().default('sdc-api-gateway'),

  apiDefaultVersion: z.string().default('v1'),
  apiSupportedVersions: z.string().transform(s => s.split(',').map(v => v.trim())),
});

export type GatewayConfig = z.output<typeof ConfigSchema>;

export const gatewayConfig: GatewayConfig = ConfigSchema.parse({
  port: normalizeEmpty(process.env.PORT) ?? undefined,
  host: normalizeEmpty(process.env.HOST) ?? '0.0.0.0',
  logLevel: normalizeEmpty(process.env.LOG_LEVEL) ?? 'info',
  bodyLimit: normalizeEmpty(process.env.BODY_LIMIT) ?? undefined,
  jwtIssuer: normalizeEmpty(process.env.JWT_ISSUER) ?? 'https://auth.sdc.dev',
  jwtAudience: normalizeEmpty(process.env.JWT_AUDIENCE) ?? 'sdc-gateway',
  jwksUri: normalizeEmpty(process.env.JWKS_URI) ?? 'https://auth.sdc.dev/.well-known/jwks.json',
  jwtSecret: normalizeEmpty(process.env.JWT_SECRET),
  corsOrigins: normalizeEmpty(process.env.CORS_ORIGINS)
    ? normalizeEmpty(process.env.CORS_ORIGINS)!.split(',').map(o => o.trim()).filter(Boolean)
    : [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:8081',
        'http://localhost:8082',
      ],
  telemetryUrl: normalizeEmpty(process.env.TELEMETRY_URL) ?? 'http://localhost:4001',
  workloadUrl: normalizeEmpty(process.env.WORKLOAD_URL) ?? 'http://localhost:4002',
  analyticsUrl: normalizeEmpty(process.env.ANALYTICS_URL) ?? 'http://localhost:4003',
  deviceAgentUrl: normalizeEmpty(process.env.DEVICE_AGENT_URL) ?? 'http://localhost:4004',
  billingUrl: normalizeEmpty(process.env.BILLING_URL) ?? 'http://localhost:4005',
  autoclawWs: normalizeEmpty(process.env.AUTOCLAW_WS) ?? 'ws://localhost:9500',
  farmsUrl: normalizeEmpty(process.env.FARMS_URL),
  mcpServers: normalizeEmpty(process.env.MCP_SERVERS) ?? '{}',
  mcpToken: normalizeEmpty(process.env.MCP_TOKEN) ?? '',
  rateLimitGlobalMax: normalizeEmpty(process.env.RATE_LIMIT_GLOBAL_MAX) ?? undefined,
  rateLimitGlobalWindowMs: normalizeEmpty(process.env.RATE_LIMIT_GLOBAL_WINDOW_MS) ?? undefined,
  otelEndpoint: normalizeEmpty(process.env.OTEL_EXPORTER_OTLP_ENDPOINT) ?? 'http://localhost:4317',
  otelServiceName: normalizeEmpty(process.env.OTEL_SERVICE_NAME) ?? 'sdc-api-gateway',
  apiDefaultVersion: normalizeEmpty(process.env.API_DEFAULT_VERSION) ?? 'v1',
  apiSupportedVersions: normalizeEmpty(process.env.API_SUPPORTED_VERSIONS) ?? 'v1',
});
