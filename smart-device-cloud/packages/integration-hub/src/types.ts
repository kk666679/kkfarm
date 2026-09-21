export type IntegrationType = 'slack' | 'jira' | 'gitlab' | 'datadog' | 'webhook';
export type IntegrationStatus = 'active' | 'paused' | 'error' | 'disabled';
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
  status: IntegrationStatus;
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
  reason?: string;
}

export interface IntegrationDelivery {
  id: string;
  integrationId: string;
  eventType: WebhookEventType;
  status: 'pending' | 'delivered' | 'failed';
  attempts: number;
  createdAt: string;
  deliveredAt?: string;
  error?: string;
}

export interface IntegrationRegistry {
  register(config: IntegrationConfig): void;
  get(id: string): IntegrationConfig | undefined;
  list(): IntegrationConfig[];
  remove(id: string): void;
}
