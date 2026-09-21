import type { TraceContext } from '../models/telemetry';

export type AgentTaskType =
  | 'device_provision'
  | 'device_operate'
  | 'device_diagnose'
  | 'workflow_execute'
  | 'integration_invoke'
  | 'browser_automate'
  | 'emulator_run'
  | 'remote_session';

export type AgentTaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface AgentTask {
  id: string;
  type: AgentTaskType;
  description: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  status: AgentTaskStatus;
  error?: string;
  priority: number;
  timeoutMs?: number;
  retryCount: number;
  maxRetries: number;
  dependencies: string[];
  traceId?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  updatedAt: string;
}

export interface AgentToolCall {
  id: string;
  toolName: string;
  arguments: Record<string, unknown>;
  traceId?: TraceContext;
  startedAt?: string;
  completedAt?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: unknown;
  error?: string;
}

export interface AgentObservation {
  type: 'text' | 'tool_result' | 'tool_error' | 'image';
  content: unknown;
  timestamp: string;
  traceId?: string;
}

export interface AgentPlan {
  id: string;
  taskId: string;
  name: string;
  description?: string;
  steps: AgentPlanStep[];
  createdAt: string;
  updatedAt: string;
}

export interface AgentPlanStep {
  id: string;
  name: string;
  description: string;
  toolName: string;
  arguments: Record<string, unknown>;
  dependencies: string[];
  status: AgentTaskStatus;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface AgentMemoryEntry {
  id: string;
  level: 'short-term' | 'long-term';
  salience: 'low' | 'medium' | 'high' | 'critical';
  content: Record<string, unknown>;
  summary?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  traceId?: string;
}

export interface AgentContext {
  traceId?: string;
  userId?: string;
  tenantId?: string;
  sessionId?: string;
  memory: AgentMemoryEntry[];
  recentObservations: AgentObservation[];
}

export const DEFAULT_AGENT_TIMEOUT_MS = 30000;
