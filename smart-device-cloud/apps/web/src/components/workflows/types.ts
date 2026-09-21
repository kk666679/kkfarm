import type { Node, Edge } from '@xyflow/react';

export type NodeCategory = 'flow' | 'device' | 'intelligence' | 'content' | 'control' | 'structure';

export type NodeStatus = 'idle' | 'queued' | 'running' | 'success' | 'error' | 'skipped';

export type ExecutionStatus =
  | 'idle'
  | 'queued'
  | 'running'
  | 'paused'
  | 'success'
  | 'error'
  | 'failed'
  | 'cancelled'
  | 'completed'
  | 'skipped';

export type ContentPlatformId =
  | 'tiktok'
  | 'instagram'
  | 'youtube'
  | 'linkedin'
  | 'threads'
  | 'facebook'
  | 'xiaohongshu'
  | 'shopee'
  | 'shopify';

export interface ValidationIssue {
  type: 'error' | 'warning';
  nodeId?: string;
  edgeId?: string;
  message: string;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

export interface TimelineEvent {
  type: string;
  timestamp: string;
  data?: unknown;
}

export interface StackFrame {
  nodeId: string;
  function: string;
  line: number;
}

export interface StoryboardShot {
  index: number;
  durationSeconds: number;
  description: string;
  cameraAngle?: string;
  dialogue?: string;
  status?: 'pending' | 'generating' | 'done' | 'failed';
}

export interface TrendItem {
  topic: string;
  platform: string;
  volume: number;
  velocity: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface ScheduledSlot {
  id: string;
  scheduledAt: string;
  platform: string;
  label: string;
  optimal?: boolean;
  status?: 'scheduled' | 'published' | 'failed';
}

export type WorkflowNode = Node;
export type WorkflowEdge = Edge;
