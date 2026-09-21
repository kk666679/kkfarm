export type IntegrationType = 'slack' | 'jira' | 'gitlab' | 'datadog' | 'webhook';
export type WebhookEventType =
  | 'device_created'
  | 'device_updated'
  | 'device_deleted'
  | 'workflow_completed'
  | 'alert_triggered'
  | 'workload_finished';
export interface IntegrationConfig {
  id: string;
  type: IntegrationType;
  name: string;
  webhookUrl?: string;
  isActive: boolean;
  credentials?: {
    token?: string;
    apiKey?: string;
    secret?: string;
    username?: string;
    password?: string;
  };
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
export interface WebhookPayload {
  id: string;
  eventType: WebhookEventType;
  timestamp: string;
  data: Record<string, unknown>;
  signature?: string;
}
export interface WebhookValidationResult {
  valid: boolean;
  event: WebhookPayload;
}
//# sourceMappingURL=integration.d.ts.map
