import type { McpServer } from './create-server';
import type { McpAuthContext } from '../auth/types';
import type { McpToolContext } from '../types';

export interface StatelessRequest {
  body: string;
  headers: Record<string, string>;
  method: string;
  url: string;
}

export interface StatelessResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
}

export interface StatelessTransportOptions {
  requireAuth: boolean;
  requireTls: boolean;
  maxRequestSize: number;
  requestTimeoutMs: number;
  instanceId: string;
  instances?: number;
  roundRobin?: boolean;
}

export class StatelessTransport {
  readonly options: Required<StatelessTransportOptions>;
  private instanceIndex = 0;
  private readonly instanceCount: number;

  constructor(options: StatelessTransportOptions) {
    this.options = {
      requireAuth: options.requireAuth ?? true,
      requireTls: options.requireTls ?? true,
      maxRequestSize: options.maxRequestSize ?? 1024 * 1024,
      requestTimeoutMs: options.requestTimeoutMs ?? 30000,
      instanceId: options.instanceId ?? `mcp-${Date.now()}`,
      instances: options.instances ?? 1,
      roundRobin: options.roundRobin ?? false,
    };
    this.instanceCount = this.options.instances;
  }

  getInstanceId(): string {
    return this.options.instanceId;
  }

  nextInstance(): number {
    const idx = this.instanceIndex;
    this.instanceIndex = (this.instanceIndex + 1) % this.instanceCount;
    return idx;
  }

  validateRequest(req: StatelessRequest): { valid: boolean; error?: string } {
    if (this.options.requireTls && req.headers['x-forwarded-proto'] !== 'https') {
      return { valid: false, error: 'TLS required' };
    }

    const contentLength = parseInt(req.headers['content-length'] ?? '0', 10);
    if (contentLength > this.options.maxRequestSize) {
      return { valid: false, error: 'Request too large' };
    }

    return { valid: true };
  }

  async extractAuthContext(server: McpServer, authHeader?: string): Promise<McpAuthContext | null> {
    if (!this.options.requireAuth) {
      return {
        userId: 'anonymous',
        email: '',
        name: '',
        roles: [],
        scopes: [],
        permissions: [],
        authenticated: false,
      };
    }

    const token = server.auth.extractBearerToken(authHeader);
    if (!token) {
      return null;
    }

    const result = await server.auth.validate(token);
    if (result.error) {
      throw result.error;
    }
    return result.context ?? null;
  }

  async buildToolContext(server: McpServer, authHeader?: string): Promise<McpToolContext> {
    const context = await this.extractAuthContext(server, authHeader);
    return {
      ...(context?.userId ? { userId: context.userId } : {}),
      ...(context?.tenantId ? { tenantId: context.tenantId } : {}),
      ...(context ? { auth: context } : {}),
    };
  }
}
