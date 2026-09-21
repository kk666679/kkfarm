import { BaseIntegrationAdapter } from '../base';
import type { IntegrationConfig, IntegrationDelivery, WebhookPayload } from '../../types';

export class SlackClient extends BaseIntegrationAdapter {
  readonly type = 'slack';

  async send(config: IntegrationConfig, payload: WebhookPayload): Promise<IntegrationDelivery> {
    if (!config.webhookUrl) throw new Error('Slack webhook URL is required');
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `${payload.eventType}: ${JSON.stringify(payload.data)}` }),
    });
    return {
      id: `delivery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      integrationId: config.id,
      eventType: payload.eventType,
      status: response.ok ? 'delivered' : 'failed',
      attempts: 1,
      createdAt: new Date().toISOString(),
      ...(response.ok ? { deliveredAt: new Date().toISOString() } : {}),
      ...(response.ok ? {} : { error: `Slack HTTP ${response.status}` }),
    };
  }

  async test(config: IntegrationConfig): Promise<boolean> {
    return Boolean(config.webhookUrl);
  }
}

export class SlackNotificationClient extends SlackClient {
  async notify(config: IntegrationConfig, message: string): Promise<IntegrationDelivery> {
    return this.send(config, {
      id: `event-${Date.now()}`,
      eventType: 'alert_triggered',
      timestamp: new Date().toISOString(),
      data: { message },
    });
  }
}

export class SlackCommandClient extends SlackClient {
  async acknowledge(config: IntegrationConfig, command: string): Promise<boolean> {
    return command.trim().length > 0 && (await this.test(config));
  }
}
