import type { McpAuthContext } from './auth/types';

export interface McpServerInfo {
  name: string;
  version: string;
}

export interface McpServerCapabilities {
  tools?: {
    listChanged?: boolean;
  };
  resources?: {
    subscribe?: boolean;
    listChanged?: boolean;
  };
  prompts?: {
    listChanged?: boolean;
  };
  experimental?: Record<string, unknown>;
}

export interface McpToolContext {
  deviceId?: string;
  workflowId?: string;
  integrationId?: string;
  userId?: string;
  tenantId?: string;
  traceId?: string;
  auth?: McpAuthContext;
}

export interface McpToolDefinition<TInput = Record<string, unknown>, TOutput = unknown> {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  annotations?: {
    title?: string;
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
  };
  requiredScopes?: string[];
  execute: (input: TInput, context: McpToolContext) => Promise<TOutput>;
}

export type McpToolInput = Record<string, unknown>;
export type McpToolOutput = unknown;

export interface McpInitializeResult {
  protocolVersion: string;
  serverInfo: McpServerInfo;
  capabilities: McpServerCapabilities;
  instructions?: string;
}

export interface McpResponse<T = unknown> {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface McpToolResult {
  content: McpContent[];
  isError?: boolean;
}

export type McpContent = McpTextContent | McpImageContent | McpEmbeddedResource;

export interface McpTextContent {
  type: 'text';
  text: string;
  annotation?: {
    audience?: 'user' | 'assistant';
    priority?: 'low' | 'medium' | 'high';
  };
}

export interface McpImageContent {
  type: 'image';
  data: string;
  mimeType: string;
  annotation?: {
    audience?: 'user' | 'assistant';
    priority?: 'low' | 'medium' | 'high';
  };
}

export interface McpEmbeddedResource {
  type: 'resource';
  resource: {
    uri: string;
    mimeType: string;
    text?: string;
  };
  annotation?: {
    audience?: 'user' | 'assistant';
    priority?: 'low' | 'medium' | 'high';
  };
}

export interface McpNotification {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, unknown>;
}

export interface McpToolCallRequest {
  jsonrpc: '2.0';
  id: string | number | null;
  method: string;
  params: {
    name: string;
    arguments?: Record<string, unknown>;
  };
}

export interface McpListToolsRequest {
  jsonrpc: '2.0';
  id: string | number | null;
  method: 'tools/list';
}

export interface McpServerDiscoverRequest {
  jsonrpc: '2.0';
  id: string | number | null;
  method: 'server/discover';
}

export { McpAuthContext };
