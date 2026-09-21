import type { DeviceListParams } from './types/device';
import type { WorkflowCreateParams } from './types/workflow';
import type { IntegrationCreateParams } from './types/integration';

export interface SdkConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
}

export interface PartnerConfig extends SdkConfig {
  partnerId: string;
  partnerName: string;
}

export class SdcClient {
  protected readonly baseUrl: string;
  protected readonly headers: Record<string, string>;
  protected readonly timeout: number;

  constructor(config: SdkConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` };
    this.timeout = config.timeout ?? 30000;
  }

  protected async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: this.headers,
        body: body !== undefined ? JSON.stringify(body) : null,
        signal: controller.signal as globalThis.AbortSignal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      return res.json() as Promise<T>;
    } finally {
      clearTimeout(timer);
    }
  }

  // Devices
  listDevices(params?: DeviceListParams) {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return this.request<{ devices: unknown[] }>('GET', `/api/v1/devices${qs}`);
  }

  getDevice(id: string) {
    return this.request<{ device: unknown }>('GET', `/api/v1/devices/${id}`);
  }

  // Workflows
  listWorkflows() {
    return this.request<{ workflows: unknown[] }>('GET', '/api/v1/workflows');
  }

  createWorkflow(params: WorkflowCreateParams) {
    return this.request<{ workflow: unknown }>('POST', '/api/v1/workflows', params);
  }

  executeWorkflow(id: string) {
    return this.request<{ execution: unknown }>('POST', `/api/v1/workflows/${id}/execute`);
  }

  // Integrations
  listIntegrations() {
    return this.request<{ integrations: unknown[] }>('GET', '/api/v1/integrations');
  }

  createIntegration(params: IntegrationCreateParams) {
    return this.request<{ integration: unknown }>('POST', '/api/v1/integrations', params);
  }
}

export class PartnerSdkClient extends SdcClient {
  private readonly partnerId: string;
  private readonly partnerName: string;

  constructor(config: PartnerConfig) {
    super(config);
    this.partnerId = config.partnerId;
    this.partnerName = config.partnerName;
  }

  // Partner-specific API methods
  getPartnerDevices() {
    return this.request<{ devices: unknown[] }>(
      'GET',
      `/api/v1/partners/${this.partnerId}/devices`
    );
  }

  getPartnerWorkflows() {
    return this.request<{ workflows: unknown[] }>(
      'GET',
      `/api/v1/partners/${this.partnerId}/workflows`
    );
  }

  getPartnerUsage() {
    return this.request<{
      apiCalls: number;
      apiLimit: number;
      storage: number;
      storageLimit: number;
      devices: number;
      apiCallsThisMonth?: number;
      storageUsedThisMonth?: number;
    }>('GET', `/api/v1/partners/${this.partnerId}/usage`);
  }

  getApiKeys() {
    return this.request<{ keys: unknown[] }>('GET', `/api/v1/partners/${this.partnerId}/api-keys`);
  }

  createApiKey(name: string) {
    return this.request<{ key: unknown }>('POST', `/api/v1/partners/${this.partnerId}/api-keys`, {
      name,
    });
  }

  getDocumentation() {
    return this.request<{ sections: unknown[] }>('GET', '/api/v1/partners/documentation');
  }

  createWebhook(params: { url: string; events: string[] }) {
    return this.request<{ webhook: unknown }>(
      'POST',
      `/api/v1/partners/${this.partnerId}/webhooks`,
      params
    );
  }
}
