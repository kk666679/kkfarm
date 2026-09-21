export type { AgentTask, AgentToolCall, AgentTaskType, AgentTaskStatus } from './task';
export type { AgentPlan, AgentPlanStep, AgentContext, PlanValidationError } from './plan';

export interface ToolCallResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (input: Record<string, unknown>) => Promise<ToolCallResult>;
}

export interface ToolRegistry {
  register(tool: ToolDefinition): void;
  get(name: string): ToolDefinition | undefined;
  list(): ToolDefinition[];
  execute(name: string, input: Record<string, unknown>): Promise<ToolCallResult>;
}

export const createToolRegistry = (): ToolRegistry => {
  const tools = new Map<string, ToolDefinition>();

  return {
    register(tool: ToolDefinition): void {
      tools.set(tool.name, tool);
    },
    get(name: string): ToolDefinition | undefined {
      return tools.get(name);
    },
    list(): ToolDefinition[] {
      return Array.from(tools.values());
    },
    async execute(name: string, input: Record<string, unknown>): Promise<ToolCallResult> {
      const tool = tools.get(name);
      if (!tool) {
        return { success: false, error: `Tool not found: ${name}` };
      }
      try {
        return await tool.handler(input);
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    },
  };
};
