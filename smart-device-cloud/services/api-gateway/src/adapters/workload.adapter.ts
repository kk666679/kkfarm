import { HttpAdapter } from './http-adapter.js';

export class WorkloadAdapter extends HttpAdapter {
  constructor(baseUrl: string, token: string | null) {
    super('workload', baseUrl, token);
  }

  listWorkloads(params: Record<string, string>) {
    return this.request('/workloads', { query: params });
  }

  startWorkload(id: string) {
    return this.request(`/workloads/${id}/start`, { method: 'POST' });
  }
}
