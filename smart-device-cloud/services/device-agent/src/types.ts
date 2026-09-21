/**
 * Device Agent Protocol Types and Interfaces
 */

export type DeviceState =
  | 'Provisining'
  | 'Ready'
  | 'Online'
  | 'Degraded'
  | 'Offline'
  | 'Maintenance'
  | 'Quarantined'
  | 'Retiring';

export type MessageType = 'heartbeat' | 'command' | 'response' | 'error';

export interface DeviceMetrics {
  cpu_percent: number;
  memory_percent: number;
  storage_percent: number;
  battery_percent: number;
  temperature_celsius: number;
  network_latency_ms: number;
  network_packet_loss_percent: number;
}

export interface SessionInfo {
  id: string;
  duration_seconds: number;
  region: string;
}

export interface WorkloadInfo {
  id: string;
  progress_percent: number;
}

export interface ApplicationInfo {
  name: string;
  version: string;
  running: boolean;
  healthy: boolean;
}

export interface HeartbeatMessage {
  type: 'heartbeat';
  device_id: string;
  timestamp: number;
  metrics: DeviceMetrics;
  session: SessionInfo;
  workload?: WorkloadInfo;
  applications: ApplicationInfo[];
}

export interface CommandMessage {
  type: 'command';
  command_id: string;
  action: 'restart_agent' | 'reboot' | 'install_app' | 'launch_app' | 'stop_workload';
  parameters: Record<string, unknown>;
}

export interface ResponseMessage {
  type: 'response';
  command_id: string;
  status: 'success' | 'failure';
  data?: Record<string, unknown>;
  error?: string;
}

export interface ErrorMessage {
  type: 'error';
  error_code: string;
  message: string;
  timestamp: number;
}

export type AgentMessage = HeartbeatMessage | CommandMessage | ResponseMessage | ErrorMessage;

export interface AgentCommand {
  action:
    | 'restart_agent'
    | 'reboot'
    | 'install_app'
    | 'launch_app'
    | 'stop_workload'
    | 'start_workflow'
    | 'stop_workflow';
  parameters: Record<string, unknown>;
}
