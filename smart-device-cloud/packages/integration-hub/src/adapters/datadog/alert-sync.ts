import type { IntegrationConfig, WebhookPayload } from '../../types';
import { DatadogClient } from './client';

export class DatadogAlertSync extends DatadogClient {
  async sync(
    config: IntegrationConfig,
    payload: WebhookPayload
  ): Promise<{ acknowledged: boolean; eventType: string }> {
    return { acknowledged: await this.test(config), eventType: payload.eventType };
  }
}
