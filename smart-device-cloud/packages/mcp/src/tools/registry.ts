import type { McpToolDefinition, McpToolContext } from '../types';
import type { McpAuthContext } from '../auth/types';

export type { McpToolDefinition, McpToolContext };

export class McpToolRegistry {
  private readonly tools = new Map<string, McpToolDefinition>();
  private readonly scopes = new Map<string, string[]>();

  register<TInput = Record<string, unknown>, TOutput = unknown>(
    tool: McpToolDefinition<TInput, TOutput>
  ): void {
    this.tools.set(tool.name, tool as McpToolDefinition);
    if (tool.requiredScopes && tool.requiredScopes.length > 0) {
      this.scopes.set(tool.name, tool.requiredScopes);
    }
  }

  get(name: string): McpToolDefinition | undefined {
    return this.tools.get(name);
  }

  list(): McpToolDefinition[] {
    return Array.from(this.tools.values());
  }

  names(): string[] {
    return Array.from(this.tools.keys());
  }

  getRequiredScopes(name: string): string[] {
    return this.scopes.get(name) ?? [];
  }

  clear(): void {
    this.tools.clear();
    this.scopes.clear();
  }

  size(): number {
    return this.tools.size;
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }
}

export async function dispatchTool(
  registry: McpToolRegistry,
  name: string,
  input: Record<string, unknown>,
  context: McpToolContext
): Promise<unknown> {
  const tool = registry.get(name);
  if (!tool) {
    throw new Error(`Tool not found: ${name}`);
  }

  return tool.execute(input, context);
}

export { createDefaultRegistry };

function createDefaultRegistry(): McpToolRegistry {
  return new McpToolRegistry();
}

export type { McpAuthContext };
