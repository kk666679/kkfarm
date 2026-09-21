import { buildApiUrl } from '@/lib/api';

export interface DashboardStats {
  totalDevices: number;
  onlineDevices: number;
  busyDevices: number;
  offlineDevices: number;
  runningTasks: number;
  queuedTasks: number;
  completedTasks: number;
  failedTasks: number;
  successRate: number;
  avgResponseTime: number;
  throughputPerHour: number;
}

export interface UtilizationData {
  time: string;
  utilization: number;
  activeDevices: number;
  totalDevices: number;
}

export interface RecentActivity {
  id: string;
  type: 'device' | 'task' | 'user' | 'system';
  action: string;
  description: string;
  timestamp: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  deviceId?: string;
  userId?: string;
}

export interface DeviceHealthData {
  deviceId: string;
  name: string;
  healthScore: number;
  battery: number;
  temperature: number;
  cpu: number;
  memory: number;
  issues: string[];
}

async function normalize<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? body?.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const analyticsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const [fleet, health] = await Promise.all([
      normalize<any>(await fetch(buildApiUrl('/analytics/fleet-metrics'))),
      normalize<any>(await fetch(buildApiUrl('/analytics/health-metrics'))),
    ]);
    return {
      totalDevices: fleet?.totalDevices ?? fleet?.devices ?? 0,
      onlineDevices: fleet?.onlineDevices ?? 0,
      busyDevices: fleet?.busyDevices ?? 0,
      offlineDevices: fleet?.offlineDevices ?? 0,
      runningTasks: fleet?.runningTasks ?? 0,
      queuedTasks: fleet?.queuedTasks ?? 0,
      completedTasks: fleet?.completedTasks ?? 0,
      failedTasks: fleet?.failedTasks ?? 0,
      successRate: fleet?.successRate ?? 0,
      avgResponseTime: fleet?.avgResponseTime ?? 0,
      throughputPerHour: fleet?.throughputPerHour ?? 0,
    };
  },

  async getDeviceUtilization(
    period: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<UtilizationData[]> {
    const data = await normalize<any>(
      await fetch(buildApiUrl(`/analytics/fleet-metrics?range=${period}`))
    );
    return data?.utilization ?? data?.points ?? [];
  },

  async getRecentActivity(): Promise<RecentActivity[]> {
    const data = await normalize<any>(
      await fetch(buildApiUrl('/analytics/fleet-metrics?activity=true&limit=20'))
    );
    return data?.activity ?? data?.recentActivity ?? [];
  },

  async getDeviceHealthOverview(): Promise<DeviceHealthData[]> {
    const data = await normalize<any>(await fetch(buildApiUrl('/analytics/health-metrics')));
    return data?.devices ?? data?.health ?? [];
  },
};
