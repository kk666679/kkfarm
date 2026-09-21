import { AppError } from '../errors/error-types.js';
import type { Adapter, AdapterRequestOptions } from './base.adapter.js';

export abstract class HttpAdapter implements Adapter {
  constructor(
    public readonly name: string,
    protected readonly baseUrl: string,
    protected readonly token: string | null,
    protected readonly defaultTimeoutMs = 10_000
  ) {}

  async health(): Promise<{ healthy: boolean; details?: unknown }> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, {
        signal: AbortSignal.timeout(2000) as globalThis.AbortSignal,
      });
      return { healthy: res.ok };
    } catch (error) {
      return { healthy: false, details: (error as Error).message };
    }
  }

  async request<T>(path: string, options: AdapterRequestOptions = {}): Promise<T> {
    const url = new URL(path, this.baseUrl);
    if (options.query) {
      for (const [k, v] of Object.entries(options.query)) {
        url.searchParams.set(k, v);
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    if (options.requestId) headers['X-Request-ID'] = options.requestId;
    if (options.traceContext) Object.assign(headers, options.traceContext);

    const res = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: AbortSignal.timeout(
        options.timeoutMs ?? this.defaultTimeoutMs
      ) as globalThis.AbortSignal,
    });

    if (!res.ok) {
      const body = await res.text();
      throw new AppError({
        code: 'upstream_error',
        title: `Upstream error from ${this.name}`,
        status: res.status,
        message: body,
      });
    }

    const contentType = res.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return (await res.json()) as T;
    }
    return (await res.text()) as T;
  }
}
