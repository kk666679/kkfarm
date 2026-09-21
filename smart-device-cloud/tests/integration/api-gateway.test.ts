import { describe, it, expect } from 'vitest';
import { McpToolRegistry, dispatchTool } from '../../packages/mcp/src/tools/registry';

describe('api-gateway integration', () => {
  it('tool registry registers and dispatches tools', async () => {
    const registry = new McpToolRegistry();
    registry.register({
      name: 'test.ping',
      description: 'Ping',
      execute: async () => ({ pong: true }),
    });

    expect(registry.has('test.ping')).toBe(true);
    const result = await dispatchTool(registry, 'test.ping', {}, {});
    expect(result).toEqual({ pong: true });
  });

  it('throws on unknown tool dispatch', async () => {
    const registry = new McpToolRegistry();
    await expect(dispatchTool(registry, 'unknown', {}, {})).rejects.toThrow('Tool not found');
  });
});
