import type { ZodError } from 'zod';
import { MCP_ERROR_CODES, type McpErrorValue, getErrorCodeMessage } from './codes';

export interface McpRpcError {
  code: number;
  message: string;
  data?: unknown;
}

export interface McpRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: T;
  error?: McpRpcError;
}

export function formatInvalidParamsError(
  error: ZodError,
  id: string | number | null
): McpRpcResponse {
  const firstIssue = error.issues?.[0];
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code: MCP_ERROR_CODES.INVALID_PARAMS,
      message: firstIssue?.message || getErrorCodeMessage(MCP_ERROR_CODES.INVALID_PARAMS),
      data: error.issues?.map(i => ({
        path: i.path,
        message: i.message,
        code: i.code,
      })),
    },
  };
}

export function formatRpcError(
  code: McpErrorValue,
  message: string,
  id: string | number | null,
  data?: unknown
): McpRpcResponse {
  return {
    jsonrpc: '2.0',
    id,
    error: { code, message, data },
  };
}

export function formatInternalError(error: Error, id: string | number | null): McpRpcResponse {
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code: MCP_ERROR_CODES.INTERNAL_ERROR,
      message: error.message,
      data: error.stack,
    },
  };
}

export function formatToolError(
  error: Error | unknown,
  id: string | number | null
): McpRpcResponse {
  const message = error instanceof Error ? error.message : String(error);
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code: MCP_ERROR_CODES.TOOL_EXECUTION_ERROR,
      message,
    },
  };
}

export { MCP_ERROR_CODES, getErrorCodeMessage };
export type { McpErrorValue };
