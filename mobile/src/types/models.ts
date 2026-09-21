import type {
  Device as SharedDevice,
  DeviceStatus as SharedDeviceStatus,
  DeviceHealthStatus as SharedHealthStatus,
  Task as SharedTask,
  TaskStatus as SharedTaskStatus,
  TaskType as SharedTaskType,
  User as SharedUser,
  UserRole as SharedUserRole,
} from '@smart-device-cloud/shared';

export type DeviceStatus = SharedDeviceStatus;
export type DeviceHealthStatus = SharedHealthStatus;
export type TaskStatus = SharedTaskStatus;
export type TaskType = SharedTaskType;
export type UserRole = SharedUserRole;

export type ConnectionType = 'USB' | 'WiFi' | 'Cloud';
export type Platform = 'iOS' | 'Android';
export type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'critical';
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'unhealthy' | 'error';
export type NetworkType = 'none' | 'unknown' | 'cellular' | 'wifi' | 'ethernet';

export interface Device extends SharedDevice {
  platform: Platform;
  connectionType: ConnectionType;
  lastSeen: string;
  batteryLevel: number;
  temperature?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  storageUsage?: number;
  networkLatency?: number;
  capabilities?: string[];
  model?: string;
  serialNumber?: string;
  osVersion?: string;
  screenResolution?: string;
}

export interface DeviceDetails extends Device {
  taskHistory: TaskSummary[];
  metrics: DeviceMetrics;
}

export interface DeviceMetrics {
  totalTasksCompleted: number;
  successRate: number;
  averageExecutionTime: number;
  uptime: number;
}

export interface DeviceRegistrationData {
  name: string;
  provider: string;
  serial?: string;
  androidVersion?: string;
  apiLevel?: number;
  adbHost?: string;
  adbPort?: number;
}

export interface DeviceCredentials {
  username?: string;
  password?: string;
  apiKey?: string;
}

export interface Task extends SharedTask {
  name: string;
  priority: number;
  payload: Record<string, unknown>;
  progress: number;
  retryCount: number;
  maxRetries: number;
  timeoutMs?: number;
  error?: string;
  deviceId?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface TaskSummary {
  id: string;
  name: string;
  type: TaskType;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
}

export interface TaskResult {
  taskId: string;
  deviceId: string;
  status: TaskStatus;
  output: unknown;
  error?: string;
  executionTime: number;
  screenshots: string[];
  logs: string[];
  completedAt: string;
}

export interface TaskCreationData {
  name: string;
  type: TaskType;
  priority?: number;
  payload?: Record<string, unknown>;
  deviceId?: string;
  maxRetries?: number;
  timeoutMs?: number;
}

export interface TaskFilters {
  status?: TaskStatus[];
  type?: TaskType[];
  deviceId?: string;
  dateRange?: DateRange;
}

export interface User extends SharedUser {
  username: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
}

export interface SystemMetrics {
  timestamp: string;
  devices: {
    total: number;
    online: number;
    offline: number;
    busy: number;
    error: number;
    starting: number;
    stopping: number;
  };
  tasks: {
    total: number;
    queued: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
    averageDurationSeconds: number;
    successRate: number;
  };
  generatedAt: string;
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  metadata: Record<string, any>;
}

export interface LogFilter {
  levels: LogLevel[];
  sources: string[];
  searchText: string;
  dateRange?: DateRange;
}

export interface CommandResult {
  command: string;
  success: boolean;
  output: string;
  error?: string;
  executedAt: string;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface TimeRange {
  duration: number;
  unit: 'hour' | 'day' | 'week' | 'month';
}

export interface MetricDataPoint {
  timestamp: string;
  value: number;
}

export type MetricType = 'cpu' | 'memory' | 'taskRate' | 'successRate' | 'executionTime';

export interface ValidationErrors {
  [field: string]: string;
}

export interface QueuedRequest {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  timestamp: string;
  retryCount: number;
}

export interface ErrorLogEntry {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  context: any;
  source: string;
}

export interface TaskConfiguration {
  name: string;
  type: string;
  configuration?: Record<string, any>;
  priority: number;
}
