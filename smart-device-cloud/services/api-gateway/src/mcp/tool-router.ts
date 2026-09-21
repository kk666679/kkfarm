export async function routeToolCall(
  server: string,
  tool: string,
  args: unknown,
  servers: Record<string, string>,
  token: string
) {
  const url = servers[server];
  if (!url) throw new Error(`Unknown MCP server: ${server}`);
  const res = await fetch(`${url}/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ method: 'tools/call', params: { name: tool, arguments: args } }),
  });
  return res.json();
}
