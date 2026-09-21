export interface DeviceSummary {
  id: string;
  name: string;
  model: string;
  status: 'online' | 'offline' | 'busy' | 'available' | 'maintenance';
  health: 'healthy' | 'warning' | 'critical';
  battery: number;
  pool?: string;
  currentTask?: string;
  agent?: string;
  lastSeen: string;
  tags?: string[];
}

export interface SessionInfo {
  id: string;
  deviceId: string;
  status: 'active' | 'idle' | 'disconnected';
  startedAt: string;
  app?: string;
  task?: string;
}

export interface TaskInfo {
  id: string;
  name: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'paused';
  priority: 'low' | 'normal' | 'high' | 'critical';
  deviceId?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface QueueStatus {
  queued: number;
  running: number;
  completed: number;
  failed: number;
  paused: number;
}

export interface AlertInfo {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  deviceId?: string;
  createdAt: string;
  acknowledged: boolean;
}

export interface EvidenceItem {
  id: string;
  type: 'screenshot' | 'recording' | 'log' | 'verification' | 'device-state';
  title: string;
  url?: string;
  timestamp: string;
  taskId?: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'waiting-approval' | 'failed' | 'degraded';
  progress: number;
  plan?: PlanStep[];
  deviceCount: number;
}

export interface PlanStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  reason?: string;
}

export interface ApprovalRequest {
  id: string;
  action: string;
  targets: string[];
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
}
