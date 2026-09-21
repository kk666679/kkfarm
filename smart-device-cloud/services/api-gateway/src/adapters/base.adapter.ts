export interface Adapter {
  readonly name: string;
  health(): Promise<{ healthy: boolean; details?: unknown }>;
  request<T>(path: string, options?: AdapterRequestOptions): Promise<T>;
}

export interface AdapterRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  timeoutMs?: number;
  requestId?: string;
  traceContext?: Record<string, string>;
}
