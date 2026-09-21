import type { IntegrationConfig, WebhookPayload } from '../../types';
import { JiraClient } from './client';

export class JiraWorkflowBridge extends JiraClient {
  async transition(
    config: IntegrationConfig,
    payload: WebhookPayload,
    transition: string
  ): Promise<{ transition: string; accepted: boolean }> {
    const accepted = Boolean(transition.trim() && (await this.test(config)));
    return { transition, accepted };
  }
}
