import { z } from 'zod';
import { IntegrationType, WebhookEventType } from '../models/integration';

export const IntegrationConfigSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['slack', 'jira', 'gitlab', 'datadog', 'webhook']),
  name: z.string().min(1).max(255),
  webhookUrl: z.string().url().optional(),
  isActive: z.boolean(),
  credentials: z
    .object({
      token: z.string().optional(),
      apiKey: z.string().optional(),
      secret: z.string().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
    })
    .optional(),
  config: z.record(z.string(), z.unknown()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const WebhookPayloadSchema = z.object({
  id: z.string().uuid(),
  eventType: z.enum([
    'device_created',
    'device_updated',
    'device_deleted',
    'workflow_completed',
    'alert_triggered',
    'workload_finished',
  ]),
  timestamp: z.string().datetime(),
  data: z.record(z.string(), z.unknown()),
  signature: z.string().optional(),
});

export const WebhookValidationResultSchema = z.object({
  valid: z.boolean(),
  event: WebhookPayloadSchema,
});

export type IntegrationConfigInput = z.output<typeof IntegrationConfigSchema>;
export type WebhookPayloadInput = z.output<typeof WebhookPayloadSchema>;
export type WebhookValidationResultInput = z.output<typeof WebhookValidationResultSchema>;

export type { IntegrationType, WebhookEventType };
