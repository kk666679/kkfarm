import type { IntegrationConfig, IntegrationDelivery, WebhookPayload } from '../types';

export interface WebhookDispatcherOptions {
  retries?: number;
  timeoutMs?: number;
}

export class WebhookDispatcher {
  constructor(private readonly options: WebhookDispatcherOptions = {}) {}

  async dispatch(config: IntegrationConfig, payload: WebhookPayload): Promise<IntegrationDelivery> {
    if (!config.isActive || !config.webhookUrl)
      throw new Error('Webhook integration is not active');
    const retries = this.options.retries ?? 2;
    let lastError: unknown;
    for (let attempt = 1; attempt <= retries + 1; attempt += 1) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.options.timeoutMs ?? 10000);
        const response = await fetch(config.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(payload.signature ? { 'X-Webhook-Signature': payload.signature } : {}),
          },
          body: JSON.stringify(payload),
          signal: controller.signal as globalThis.AbortSignal,
        });
        clearTimeout(timer);
        if (response.ok)
          return {
            id: `delivery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            integrationId: config.id,
            eventType: payload.eventType,
            status: 'delivered',
            attempts: attempt,
            createdAt: new Date().toISOString(),
            deliveredAt: new Date().toISOString(),
          };
        lastError = new Error(`Webhook HTTP ${response.status}`);
      } catch (error) {
        lastError = error;
      }
    }
    return {
      id: `delivery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      integrationId: config.id,
      eventType: payload.eventType,
      status: 'failed',
      attempts: retries + 1,
      createdAt: new Date().toISOString(),
      ...(lastError
        ? { error: lastError instanceof Error ? lastError.message : String(lastError) }
        : {}),
    };
  }
}
