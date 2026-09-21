/**
 * AgentSurface — typed contract between the AI backend and the UI.
 *
 * The model emits exactly one of these discriminated unions. It NEVER emits
 * JSX, HTML, or executable strings. AgentSurfaceRenderer maps each `kind`
 * to an approved React component.
 */

export type SurfaceKind =
  | 'text'
  | 'device-list'
  | 'device-grid'
  | 'device-detail'
  | 'plan'
  | 'task'
  | 'queue'
  | 'approval'
  | 'execution'
  | 'evidence'
  | 'timeline'
  | 'metric-chart'
  | 'log-viewer'
  | 'screenshot'
  | 'terminal'
  | 'alert'
  | 'sources';

export interface SurfaceSource {
  id: string;
  label: string;
  href?: string;
  kind: 'device' | 'workflow' | 'agent' | 'evidence' | 'doc' | 'external';
}

export interface SurfaceDeviceFilter {
  status?: Array<'online' | 'offline' | 'busy' | 'idle' | 'error' | 'maintenance'>;
  health?: Array<'healthy' | 'degraded' | 'unhealthy'>;
  androidVersion?: string[];
  pool?: string[];
  tags?: string[];
  batteryBelow?: number;
  lastSeenBefore?: string;
  search?: string;
  limit?: number;
}

export interface SurfacePlanStep {
  id: string;
  label: string;
  description?: string;
  tool?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  durationMs?: number;
  error?: string;
}

export interface SurfaceTimelineEvent {
  id: string;
  at: string;
  kind: string;
  summary: string;
  actor?: 'user' | 'agent' | 'system';
  details?: Record<string, unknown>;
  evidenceId?: string;
}

export interface SurfaceMetricSeries {
  label: string;
  unit?: string;
  points: Array<{ t: string; v: number }>;
}

export interface SurfaceLogLine {
  id: string;
  at: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  source?: string;
  message: string;
}

export interface SurfaceApprovalProposal {
  id: string;
  action: string;
  targetDeviceIds: string[];
  parameters: Record<string, unknown>;
  impactSummary: string;
  requestedBy: { kind: 'agent' | 'user'; id: string; name: string };
  requestedAt: string;
  expiresAt?: string;
}

export interface TextSurface { kind: 'text'; markdown: string; sources?: SurfaceSource[]; }
export interface DeviceListSurface { kind: 'device-list'; filter: SurfaceDeviceFilter; caption?: string; totalCount?: number; }
export interface DeviceGridSurface { kind: 'device-grid'; deviceIds: string[]; caption?: string; }
export interface DeviceDetailSurface { kind: 'device-detail'; deviceId: string; caption?: string; }
export interface PlanSurface { kind: 'plan'; title: string; steps: SurfacePlanStep[]; totalDurationMs?: number; requiresApproval: boolean; }
export interface TaskSurface { kind: 'task'; taskId: string; label: string; status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'; progress?: number; }
export interface QueueSurface { kind: 'queue'; items: Array<{ id: string; label: string; status: 'queued' | 'running' | 'paused' | 'failed'; enqueuedAt: string; deviceCount?: number; }>; }
export interface ApprovalSurface { kind: 'approval'; proposal: SurfaceApprovalProposal; }
export interface ExecutionSurface { kind: 'execution'; runId: string; workflowId?: string; deviceIds?: string[]; caption?: string; }
export interface EvidenceSurface { kind: 'evidence'; chainId: string; caption?: string; }
export interface TimelineSurface { kind: 'timeline'; title?: string; events: SurfaceTimelineEvent[]; }
export interface MetricChartSurface { kind: 'metric-chart'; title: string; range: { from: string; to: string }; series: SurfaceMetricSeries[]; }
export interface LogViewerSurface { kind: 'log-viewer'; title?: string; source: string; lines: SurfaceLogLine[]; }
export interface ScreenshotSurface { kind: 'screenshot'; deviceId: string; at: string; url: string; caption?: string; }
export interface TerminalSurface { kind: 'terminal'; sessionId: string; cwd?: string; lines: string[]; }
export interface AlertSurface { kind: 'alert'; level: 'info' | 'warn' | 'error'; title: string; body: string; actions?: Array<{ label: string; href?: string; actionId?: string }>; }
export interface SourcesSurface { kind: 'sources'; sources: SurfaceSource[]; }

export type AgentSurface =
  | TextSurface | DeviceListSurface | DeviceGridSurface | DeviceDetailSurface
  | PlanSurface | TaskSurface | QueueSurface | ApprovalSurface | ExecutionSurface
  | EvidenceSurface | TimelineSurface | MetricChartSurface | LogViewerSurface
  | ScreenshotSurface | TerminalSurface | AlertSurface | SourcesSurface;

export interface AgentSurfaceEnvelope {
  id: string;
  createdAt: string;
  surface: AgentSurface;
}
