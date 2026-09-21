export interface McpApp {
  id: string;
  name: string;
  description?: string;
  version: string;
  tools: string[];
  icon?: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface McpAppRegistry {
  register(app: McpApp): void;
  get(id: string): McpApp | undefined;
  list(): McpApp[];
  remove(id: string): boolean;
  getTools(appId: string): string[];
}

export class InMemoryMcpAppRegistry implements McpAppRegistry {
  private readonly apps = new Map<string, McpApp>();

  register(app: McpApp): void {
    this.apps.set(app.id, app);
  }

  get(id: string): McpApp | undefined {
    return this.apps.get(id);
  }

  list(): McpApp[] {
    return Array.from(this.apps.values());
  }

  remove(id: string): boolean {
    return this.apps.delete(id);
  }

  getTools(appId: string): string[] {
    return this.apps.get(appId)?.tools ?? [];
  }
}
