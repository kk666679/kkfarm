import { CLOUD_REGIONS } from '../constants';
export type DeviceStatus =
  | 'offline'
  | 'starting'
  | 'online'
  | 'busy'
  | 'error'
  | 'stopping'
  | 'available'
  | 'in_use'
  | 'maintenance'
  | 'reserved';
export type DeviceState =
  | 'provisioning'
  | 'ready'
  | 'online'
  | 'degraded'
  | 'offline'
  | 'maintenance'
  | 'quarantined'
  | 'retiring';
export interface Device {
  id: string;
  name: string;
  provider: string;
  serial?: string;
  androidVersion?: string;
  apiLevel?: number;
  status: DeviceStatus;
  state: DeviceState;
  containerId?: string;
  adbHost?: string;
  adbPort?: number;
  assignedTaskId?: string;
  lastHeartbeat?: string;
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
  capabilities?: string[];
  ipAddress?: string;
  manufacturer?: string;
  model?: string;
  securityPatchDate?: string;
  cloudRegion?: string;
  agentVersion?: string;
  managementState?: string;
  region?: string;
  sessionId?: string;
  batteryLevel?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  storageUsage?: number;
  temperature?: number;
  networkLatency?: number;
  serialNumber?: string;
  osVersion?: string;
  healthStatus?: string;
  currentWorkloadName?: string;
  currentWorkloadProgress?: number;
}
export interface DeviceHealthStatus {
  healthy: boolean;
  details?: Record<string, unknown>;
}
export interface DeviceFilters {
  status?: DeviceStatus[];
  state?: DeviceState[];
  provider?: string[];
  region?: string[];
  assignedTaskId?: string;
  manufacturers?: string[];
  androidVersions?: string[];
  regions?: string[];
  workloads?: string[];
  healthStatus?: string[];
  batteryRange?: {
    min: number;
    max: number;
  };
  temperatureRange?: {
    min: number;
    max: number;
  };
  lastHeartbeatRange?: {
    min: string;
    max: string;
  };
}
export type DeviceCloudRegion = (typeof CLOUD_REGIONS)[number];
export interface RegionalMetrics {
  region: DeviceCloudRegion;
  deviceCount: number;
  onlineCount: number;
  onlinePercent: number;
  avgCpuPercent: number;
  avgMemoryPercent: number;
  avgLatency: number;
  packetLoss: number;
  activeSessionCount: number;
  networkHealthScore: number;
  isHealthy: boolean;
}
export interface FleetMetrics {
  totalDevices: number;
  onlineDevices: number;
  degradedDevices: number;
  offlineDevices: number;
  activeSessions: number;
  runningWorkloads: number;
  completedWorkloads: number;
  failedWorkloads: number;
  avgCpuPercent: number;
  avgMemoryPercent: number;
  avgStoragePercent: number;
  avgBattery: number;
  avgNetworkLatency: number;
  fleetHealthPercent: number;
  trends: {
    onlineDevices: number;
    avgCpuPercent: number;
    fleetHealth: number;
  };
  timestamp: string;
}
export interface HealthMetrics {
  deviceAvailabilityPercent: number;
  deviceAvailability: number;
  cpuHealthPercent: number;
  cpuHealth: number;
  memoryHealthPercent: number;
  memoryHealth: number;
  networkHealthPercent: number;
  networkHealth: number;
  applicationHealthPercent: number;
  applicationHealth: number;
  automationSuccessRate: number;
  trends: {
    deviceAvailability: number;
    cpuHealth: number;
    memoryHealth: number;
    networkHealth: number;
    applicationHealth: number;
    automationSuccessRate: number;
  };
}
export type SortOption =
  | 'health_asc'
  | 'health_desc'
  | 'cpu_asc'
  | 'cpu_desc'
  | 'memory_asc'
  | 'memory_desc'
  | 'battery_asc'
  | 'battery_desc'
  | 'temp_asc'
  | 'temp_desc'
  | 'last_seen_asc'
  | 'last_seen_desc'
  | 'workload_asc'
  | 'workload_desc'
  | 'age_asc'
  | 'age_desc';
export interface Alert {
  id: string;
  timestamp: number;
  severity: AlertSeverity;
  deviceId: string;
  deviceName: string;
  title: string;
  description: string;
  recommendedAction: string;
  status: AlertStatus;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: number;
  metadata?: Record<string, unknown>;
}
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved' | 'active';
//# sourceMappingURL=device.d.ts.map
