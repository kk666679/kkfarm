import { MCP_PROTOCOL_VERSION } from './protocol-version';
import type { McpServerCapabilities, McpServerInfo, McpToolDefinition } from '../types';

export interface McpServerDiscoverResponse {
  protocolVersion: string;
  serverInfo: McpServerInfo;
  capabilities: McpServerCapabilities;
  tools: {
    name: string;
    description: string;
    annotations?: Record<string, unknown>;
    requiredScopes?: string[];
  }[];
  extensions: string[];
}

export function buildDiscoverResponse(opts: {
  serverInfo: McpServerInfo;
  capabilities: McpServerCapabilities;
  tools: McpToolDefinition[];
  extensions: string[];
}): McpServerDiscoverResponse {
  return {
    protocolVersion: MCP_PROTOCOL_VERSION,
    serverInfo: opts.serverInfo,
    capabilities: opts.capabilities,
    tools: opts.tools.map(t => ({
      name: t.name,
      description: t.description,
      ...(t.annotations ? { annotations: t.annotations as Record<string, unknown> } : {}),
      ...((t as McpToolDefinition & { requiredScopes?: string[] }).requiredScopes
        ? {
            requiredScopes: (t as McpToolDefinition & { requiredScopes?: string[] }).requiredScopes,
          }
        : {}),
    })),
    extensions: opts.extensions,
  };
}

export { MCP_PROTOCOL_VERSION };
