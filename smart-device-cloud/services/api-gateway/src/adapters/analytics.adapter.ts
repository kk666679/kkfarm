import { HttpAdapter } from './http-adapter.js';

export class AnalyticsAdapter extends HttpAdapter {
  constructor(baseUrl: string, token: string | null) {
    super('analytics', baseUrl, token);
  }

  queryMetrics(params: Record<string, string>) {
    return this.request('/metrics/query', { query: params });
  }

  exportCsv(params: Record<string, string>) {
    return this.request('/export/csv', { query: params });
  }
}
