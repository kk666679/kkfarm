import axios from 'axios';

const API_BASE = '/api';

export interface Device {
  id: string;
  name: string;
  status: string;
  platform: string;
  model?: string;
  lastSeen: string;
  batteryLevel: number;
  temperature?: number;
  cpuUsage?: number;
  memoryUsage?: number;
}

export interface Workload {
  id: string;
  name: string;
  status: string;
  category: string;
  deviceId?: string;
  createdAt: string;
}

export interface FleetMetrics {
  totalDevices: number;
  onlineDevices: number;
  degradedDevices: number;
  offlineDevices: number;
  runningWorkloads: number;
  completedWorkloads: number;
  failedWorkloads: number;
  avgCpuUsage: number;
  avgMemoryUsage: number;
  avgTemperature: number;
  timestamp: string;
}

export interface UtilizationPoint {
  time: string;
  utilization: number;
  activeDevices: number;
  totalDevices: number;
}

export interface ActivityItem {
  id: string;
  type: 'device' | 'workload' | 'system';
  action: string;
  description: string;
  timestamp: string;
  severity: 'info' | 'success' | 'warning' | 'error';
}

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const cloudService = {
  async getDevices(): Promise<Device[]> {
    const res = await api.get('/devices');
    return res.data.devices ?? res.data;
  },

  async getWorkloads(): Promise<Workload[]> {
    const res = await api.get('/workloads');
    return res.data.workloads ?? res.data;
  },

  async getFleetMetrics(): Promise<FleetMetrics> {
    const res = await api.get('/telemetry/fleet/metrics');
    return res.data;
  },

  async getDeviceUtilization(hours = 24): Promise<UtilizationPoint[]> {
    const res = await api.get('/telemetry/fleet/metrics', { params: { range: `${hours}h` } });
    return res.data.utilization ?? [];
  },

  async getRecentActivity(limit = 20): Promise<ActivityItem[]> {
    const res = await api.get('/telemetry/fleet/metrics', { params: { activity: true, limit } });
    return res.data.activity ?? [];
  },
};

export default cloudService;
