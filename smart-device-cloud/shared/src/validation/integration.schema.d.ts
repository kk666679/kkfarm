import { z } from 'zod';
import { IntegrationType, WebhookEventType } from '../models/integration';
export declare const IntegrationConfigSchema: z.ZodObject<
  {
    id: z.ZodString;
    type: z.ZodEnum<{
      webhook: 'webhook';
      slack: 'slack';
      jira: 'jira';
      gitlab: 'gitlab';
      datadog: 'datadog';
    }>;
    name: z.ZodString;
    webhookUrl: z.ZodOptional<z.ZodString>;
    isActive: z.ZodBoolean;
    credentials: z.ZodOptional<
      z.ZodObject<
        {
          token: z.ZodOptional<z.ZodString>;
          apiKey: z.ZodOptional<z.ZodString>;
          secret: z.ZodOptional<z.ZodString>;
          username: z.ZodOptional<z.ZodString>;
          password: z.ZodOptional<z.ZodString>;
        },
        z.core.$strip
      >
    >;
    config: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
  },
  z.core.$strip
>;
export declare const WebhookPayloadSchema: z.ZodObject<
  {
    id: z.ZodString;
    eventType: z.ZodEnum<{
      device_created: 'device_created';
      device_updated: 'device_updated';
      device_deleted: 'device_deleted';
      workflow_completed: 'workflow_completed';
      alert_triggered: 'alert_triggered';
      workload_finished: 'workload_finished';
    }>;
    timestamp: z.ZodString;
    data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    signature: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export declare const WebhookValidationResultSchema: z.ZodObject<
  {
    valid: z.ZodBoolean;
    event: z.ZodObject<
      {
        id: z.ZodString;
        eventType: z.ZodEnum<{
          device_created: 'device_created';
          device_updated: 'device_updated';
          device_deleted: 'device_deleted';
          workflow_completed: 'workflow_completed';
          alert_triggered: 'alert_triggered';
          workload_finished: 'workload_finished';
        }>;
        timestamp: z.ZodString;
        data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        signature: z.ZodOptional<z.ZodString>;
      },
      z.core.$strip
    >;
  },
  z.core.$strip
>;
export type IntegrationConfigInput = z.output<typeof IntegrationConfigSchema>;
export type WebhookPayloadInput = z.output<typeof WebhookPayloadSchema>;
export type WebhookValidationResultInput = z.output<typeof WebhookValidationResultSchema>;
export type { IntegrationType, WebhookEventType };
//# sourceMappingURL=integration.schema.d.ts.map
