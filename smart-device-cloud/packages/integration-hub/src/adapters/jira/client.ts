import { BaseIntegrationAdapter } from '../base';
import type { IntegrationConfig, IntegrationDelivery, WebhookPayload } from '../../types';

export class JiraClient extends BaseIntegrationAdapter {
  readonly type = 'jira';

  async send(config: IntegrationConfig, payload: WebhookPayload): Promise<IntegrationDelivery> {
    const endpoint = String(config.config.endpoint ?? '');
    if (!endpoint) throw new Error('Jira endpoint is required');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.credentials?.token ?? ''}`,
      },
      body: JSON.stringify({ eventType: payload.eventType, data: payload.data }),
    });
    return {
      id: `delivery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      integrationId: config.id,
      eventType: payload.eventType,
      status: response.ok ? 'delivered' : 'failed',
      attempts: 1,
      createdAt: new Date().toISOString(),
      ...(response.ok ? { deliveredAt: new Date().toISOString() } : {}),
      ...(response.ok ? {} : { error: `Jira HTTP ${response.status}` }),
    };
  }

  async test(config: IntegrationConfig): Promise<boolean> {
    return Boolean(config.config.endpoint && config.credentials?.token);
  }
}
