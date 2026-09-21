export type AgentRunStatus =
  | 'pending'
  | 'running'
  | 'waiting-approval'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type AgentPlanStepStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped';

export type AgentToolCallStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed';

export interface AgentPlanStep {
  id: string;
  label: string;
  description?: string;
  tool?: string;
  status: AgentPlanStepStatus;
  durationMs?: number;
  error?: string;
}

export interface AgentToolCall {
  id: string;
  name: string;
  args?: Record<string, unknown>;
  result?: unknown;
  error?: string;
  status: AgentToolCallStatus;
  durationMs?: number;
}

export interface AgentRunSummary {
  id: string;
  agentId: string;
  agentName: string;
  status: AgentRunStatus;
  startedAt: string;
  finishedAt?: string;
  deviceCount?: number;
  workflowId?: string;
  cost?: { tokens: number; usd: number };
}

export interface AgentIdentity {
  id: string;
  name: string;
  description?: string;
  /** Capability tags, e.g. ["device-recovery", "diagnostics"]. */
  capabilities: string[];
  /** Model name, e.g. "claude-sonnet-4". */
  model?: string;
  successRate?: number;
  avgDurationMs?: number;
  costPerRunUsd?: number;
  lastActiveAt?: string;
  enabled?: boolean;
}
