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
export declare const createToolRegistry: () => ToolRegistry;
//# sourceMappingURL=tool-call.d.ts.map
