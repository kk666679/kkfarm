import {
  Device,
  Task,
  SystemMetrics,
  User,
  LogEntry,
  DeviceStatus,
  TaskStatus,
  TaskType,
  TaskFilters,
} from './models';
import { NetworkState as ServiceNetworkState } from './services';
import type { QueuedRequest as ServiceQueuedRequest } from './models';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
  isLoading: boolean;
}

export interface DeviceState {
  devices: Device[];
  filteredDevices: Device[];
  searchText: string;
  statusFilters: DeviceStatus[];
  platformFilter: string | null;
  lastUpdate: number | null;
  error: string | null;
  isLoading: boolean;
}

export interface TaskState {
  tasks: Task[];
  filteredTasks: Task[];
  taskGroups: any[];
  filters: TaskFilters;
  lastUpdate: number | null;
  error: string | null;
  isLoading: boolean;
}

export interface FarmState {
  metrics: SystemMetrics | null;
  circuitBreakerOpen: boolean;
  maintenanceModeEnabled: boolean;
  logs: LogEntry[];
  isLoading: number;
  error: string | null;
  lastUpdate: number | null;
}

export interface GlobalLoadingState {
  loaders: Record<string, number>;
}
