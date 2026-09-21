import { HttpAdapter } from './http-adapter.js';

export class TelemetryAdapter extends HttpAdapter {
  constructor(baseUrl: string, token: string | null) {
    super('telemetry', baseUrl, token);
  }

  getTelemetry(deviceId: string, range: string) {
    return this.request(`/telemetry/${deviceId}`, { query: { range } });
  }

  streamTelemetry(deviceIds: string[]) {
    return this.request('/telemetry/stream', { method: 'POST', body: { deviceIds } });
  }
}
