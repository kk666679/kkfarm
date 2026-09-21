export const MCP_PROTOCOL_VERSION = '2026-07-28' as const;

export function getProtocolVersion(): string {
  return MCP_PROTOCOL_VERSION;
}

export function isSupportedProtocolVersion(version: string): boolean {
  return version === MCP_PROTOCOL_VERSION;
}

export const SUPPORTED_PROTOCOL_VERSIONS: readonly string[] = ['2026-07-28', '2025-11-04'];
