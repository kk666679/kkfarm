import type { Adapter, AdapterRequestOptions } from './base.adapter.js';

export class InternalAdapter implements Adapter {
  readonly name = 'internal';

  async health() {
    return { healthy: true };
  }

  async request<T>(_path: string, _options?: AdapterRequestOptions): Promise<T> {
    throw new Error('Internal adapter does not proxy to external services');
  }
}
