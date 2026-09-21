import { HttpAdapter } from './http-adapter.js';

export class FarmsAdapter extends HttpAdapter {
  constructor(baseUrl: string, token: string | null) {
    super('farms', baseUrl, token);
  }

  listDevices(params: Record<string, string>) {
    return this.request('/api/v1/devices', { query: params });
  }
}
