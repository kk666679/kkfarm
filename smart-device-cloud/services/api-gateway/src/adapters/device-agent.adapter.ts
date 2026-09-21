import { HttpAdapter } from './http-adapter.js';

export class DeviceAgentAdapter extends HttpAdapter {
  constructor(baseUrl: string, token: string | null) {
    super('deviceAgent', baseUrl, token);
  }

  listDevices(params: Record<string, string>) {
    return this.request('/devices', { query: params });
  }

  getDevice(id: string) {
    return this.request(`/devices/${id}`);
  }

  rebootDevice(id: string) {
    return this.request(`/devices/${id}/reboot`, { method: 'POST' });
  }
}
