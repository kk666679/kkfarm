export const MCP_ERROR_CODES = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,

  // MCP-specific (reserved -32000 to -32099)
  SERVER_ERROR: -32001,
  RESOURCE_NOT_FOUND: -32002,
  RESOURCE_ACCESS_DENIED: -32003,
  SERVER_UNAVAILABLE: -32004,
  TOOL_EXECUTION_ERROR: -32005,
  RATE_LIMIT_EXCEEDED: -32006,
  AUTHENTICATION_REQUIRED: -32007,
  AUTHORIZATION_FAILED: -32008,
} as const;

export type McpErrorCode = keyof typeof MCP_ERROR_CODES;
export type McpErrorValue = (typeof MCP_ERROR_CODES)[McpErrorCode];

export function getErrorCodeMessage(code: McpErrorValue): string {
  const messages: Record<McpErrorValue, string> = {
    [-32700]: 'Parse error',
    [-32600]: 'Invalid Request',
    [-32601]: 'Method not found',
    [-32602]: 'Invalid params',
    [-32603]: 'Internal error',
    [-32001]: 'Server error',
    [-32002]: 'Resource not found',
    [-32003]: 'Resource access denied',
    [-32004]: 'Server unavailable',
    [-32005]: 'Tool execution error',
    [-32006]: 'Rate limit exceeded',
    [-32007]: 'Authentication required',
    [-32008]: 'Authorization failed',
  };
  return messages[code] ?? 'Unknown error';
}
