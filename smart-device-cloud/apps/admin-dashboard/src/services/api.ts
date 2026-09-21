import axios from 'axios';

const API_BASE = '/api/v1';

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

export interface Tenant {
  id: string;
  name: string;
  plan: string;
  devices: number;
  status: 'Active' | 'Suspended';
  createdAt: string;
}

export interface BillingSummary {
  plan: string;
  planPrice: number;
  nextInvoice: number;
  usagePercent: number;
  paymentMethod: string;
  usage: { label: string; value: number }[];
  invoices: { id: string; date: string; description: string; amount: number; status: string }[];
}

export interface Integration {
  name: string;
  category: string;
  connected: boolean;
  description: string;
}

export interface AuditEvent {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  resource: string;
  description: string;
}

export interface AppSettings {
  applicationName: string;
  region: string;
  language: string;
  notifications: Record<string, boolean>;
  security: Record<string, boolean | string>;
  display: Record<string, boolean | string>;
}

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sdc-auth-token') : null;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function unwrap<T>(res: { data: any }): T {
  return res.data;
}

export const cloudService = {
  async getDevices(): Promise<Device[]> {
    return unwrap<Device[]>(await api.get('/devices'));
  },

  async getWorkloads(): Promise<Workload[]> {
    return unwrap<Workload[]>(await api.get('/workloads'));
  },

  async getFleetMetrics(): Promise<FleetMetrics> {
    const res = await api.get('/analytics/metrics');
    const data = res.data;
    return {
      totalDevices: data?.totalDevices ?? data?.devices ?? 0,
      onlineDevices: data?.onlineDevices ?? 0,
      degradedDevices: data?.degradedDevices ?? 0,
      offlineDevices: data?.offlineDevices ?? 0,
      runningWorkloads: data?.runningWorkloads ?? 0,
      completedWorkloads: data?.completedWorkloads ?? 0,
      failedWorkloads: data?.failedWorkloads ?? 0,
      avgCpuUsage: data?.avgCpuUsage ?? 0,
      avgMemoryUsage: data?.avgMemoryUsage ?? 0,
      avgTemperature: data?.avgTemperature ?? 0,
      timestamp: data?.timestamp ?? new Date().toISOString(),
    };
  },

  async getDeviceUtilization(hours = 24): Promise<UtilizationPoint[]> {
    const res = await api.get('/analytics/metrics', { params: { range: `${hours}h` } });
    return res.data?.utilization ?? res.data?.points ?? [];
  },

  async getRecentActivity(limit = 20): Promise<ActivityItem[]> {
    const res = await api.get('/analytics/metrics', { params: { activity: true, limit } });
    return res.data?.activity ?? res.data?.recentActivity ?? [];
  },

  async getTenants(): Promise<Tenant[]> {
    const res = await api.get('/tenants');
    return res.data.tenants ?? res.data;
  },

  async getTenant(id: string): Promise<Tenant> {
    const res = await api.get(`/tenants/${id}`);
    return res.data.tenant ?? res.data;
  },

  async getBillingSummary(): Promise<BillingSummary> {
    const res = await api.get('/billing/usage');
    return res.data;
  },

  async getIntegrations(): Promise<Integration[]> {
    const res = await api.get('/integrations');
    return res.data.integrations ?? res.data;
  },

  async getAuditEvents(limit = 50): Promise<AuditEvent[]> {
    const res = await api.get('/audit', { params: { limit } });
    return res.data.events ?? res.data;
  },

  async getSettings(): Promise<AppSettings> {
    const res = await api.get('/settings');
    return res.data.settings ?? res.data;
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const res = await api.put('/settings', settings);
    return res.data.settings ?? res.data;
  },
};

export default cloudService;
