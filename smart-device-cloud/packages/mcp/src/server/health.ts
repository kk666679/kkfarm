import type { McpServer } from './create-server';

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  instanceId: string;
  timestamp: string;
  protocolVersion: string;
  tools: number;
  uptimeMs: number;
}

export function createHealthHandler(server: McpServer) {
  const startTime = Date.now();

  return (_req: unknown): HealthResponse => {
    return {
      status: 'ok',
      instanceId: server.config.instanceId,
      timestamp: new Date().toISOString(),
      protocolVersion: server.protocolVersion,
      tools: server.listTools().length,
      uptimeMs: Date.now() - startTime,
    };
  };
}
