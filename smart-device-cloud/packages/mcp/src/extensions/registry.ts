import { InMemoryMcpAppRegistry, type McpAppRegistry } from './apps';
import {
  InMemoryMcpTaskRegistry,
  type McpTaskRegistry,
  type McpTask,
  type McpTaskType,
} from './tasks';

export interface ExtensionRegistry {
  apps: McpAppRegistry;
  tasks: McpTaskRegistry;
}

export function createExtensionRegistry(): ExtensionRegistry {
  return {
    apps: new InMemoryMcpAppRegistry(),
    tasks: new InMemoryMcpTaskRegistry(),
  };
}

export { InMemoryMcpAppRegistry } from './apps';
export { InMemoryMcpTaskRegistry } from './tasks';
export type { McpApp, McpAppRegistry } from './apps';
export type { McpTask, McpTaskRegistry, McpTaskType } from './tasks';
