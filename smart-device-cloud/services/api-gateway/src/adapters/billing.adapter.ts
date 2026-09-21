import { HttpAdapter } from './http-adapter.js';

export class BillingAdapter extends HttpAdapter {
  constructor(baseUrl: string, token: string | null) {
    super('billing', baseUrl, token);
  }

  getUsage(tenantId: string, period: string) {
    return this.request('/usage', { query: { tenantId, period } });
  }

  getInvoice(invoiceId: string) {
    return this.request(`/invoices/${invoiceId}`);
  }
}
