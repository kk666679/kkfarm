import type { McpServer } from './create-server';
import {
  StatelessTransport,
  type StatelessRequest,
  type StatelessResponse,
} from './stateless-transport';
import {
  formatInternalError,
  formatInvalidParamsError,
  formatToolError,
} from '../errors/formatter';
import type { McpAuthContext } from '../auth/types';
import { logger } from '../observability/logger';
import { tracer } from '../observability/tracer';

export interface HttpHandlerOptions {
  server: McpServer;
  transport: StatelessTransport;
  basePath?: string;
}

export class McpHttpHandler {
  readonly server: McpServer;
  readonly transport: StatelessTransport;
  readonly basePath: string;

  constructor(opts: HttpHandlerOptions) {
    this.server = opts.server;
    this.transport = opts.transport;
    this.basePath = opts.basePath ?? '/mcp';
  }

  async handle(req: StatelessRequest): Promise<StatelessResponse> {
    const span = tracer.startSpan('mcp.request');

    try {
      if (req.url === `${this.basePath}/health`) {
        span.end();
        return {
          status: 200,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ status: 'ok', instanceId: this.transport.getInstanceId() }),
        };
      }

      const validation = this.transport.validateRequest(req);
      if (!validation.valid) {
        span.end();
        return {
          status: 400,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ error: validation.error }),
        };
      }

      if (this.transport.options.requireAuth) {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
          span.end();
          return {
            status: 401,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ error: 'Authorization header required' }),
          };
        }

        try {
          const context = await this.transport.extractAuthContext(this.server, authHeader);
          if (!context) {
            span.end();
            return {
              status: 401,
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ error: 'Invalid or expired token' }),
            };
          }
          span.setAttribute('userId', context.userId);
          span.setAttribute('tenantId', context.tenantId ?? 'unknown');
        } catch (err) {
          span.end();
          return {
            status: 401,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ error: 'Authentication failed' }),
          };
        }
      }

      const jsonRpcRequest = this.parseBody(req);
      if (jsonRpcRequest instanceof Error) {
        span.end();
        const resp = formatInvalidParamsError(
          {
            issues: [{ path: [], message: jsonRpcRequest.message, code: 'invalid_type' }],
          } as never,
          null
        );
        return {
          status: 400,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(resp),
        };
      }

      const result = await this.server.handleRequest(jsonRpcRequest);

      span.end();
      return {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(result),
      };
    } catch (err) {
      span.recordException(err instanceof Error ? err : new Error(String(err)));
      span.setStatus({ code: 2, message: err instanceof Error ? err.message : String(err) });
      span.end();
      const resp = formatInternalError(err instanceof Error ? err : new Error(String(err)), null);
      return {
        status: 500,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(resp),
      };
    }
  }

  private parseBody(req: StatelessRequest): unknown | Error {
    try {
      return JSON.parse(req.body);
    } catch (err) {
      return err instanceof Error ? err : new Error('Invalid JSON body');
    }
  }
}
