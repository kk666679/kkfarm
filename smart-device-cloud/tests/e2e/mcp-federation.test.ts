import { describe, it, expect } from 'vitest';
import {
  registerRemoteMcpServer,
  federateToolCall,
  listRemoteMcpServers,
} from '../../shared/src/federation/mcp-federation';

describe('mcp federation e2e', () => {
  it('registers and lists remote MCP servers', () => {
    registerRemoteMcpServer({
      id: 'remote-1',
      name: 'Remote Farm',
      endpoint: 'https://farm.example.com/mcp',
      protocolVersion: '2026-07-28',
      scopes: ['device:read'],
      trustLevel: 'partial',
    });

    const servers = listRemoteMcpServers();
    expect(servers.some(s => s.id === 'remote-1')).toBe(true);
  });

  it('throws when federating to unknown server', async () => {
    await expect(
      federateToolCall('unknown-server', 'device.discover', {}, 'token')
    ).rejects.toThrow('Remote MCP server not found');
  });
});
