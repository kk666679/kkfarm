import type {
  TelemetrySample,
  Device,
  Alert,
  Workload,
  Workflow,
  Application,
  Recommendation,
  AuditLogEntry,
  FleetMetrics,
  HealthMetrics,
  RegionalMetrics,
} from '@smart-device-cloud/shared';
import { buildApiUrl } from '@/lib/api';
import { trpcClient } from '@/trpc/links';

async function restRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const res = await fetch(buildApiUrl(path), {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? body?.message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function getDevices(): Promise<Device[]> {
  const data = await restRequest<{ devices: Device[] }>('/devices');
  return data.devices;
}

export async function getDevice(id: string): Promise<Device> {
  const data = await restRequest<{ device: Device }>(`/devices/${id}`);
  return data.device;
}

export async function updateDeviceState(deviceId: string, state: Device['state']): Promise<Device> {
  const data = await restRequest<{ device: Device }>(`/devices/${deviceId}/state`, {
    method: 'PATCH',
    body: JSON.stringify({ state }),
  });
  return data.device;
}

export async function sendDeviceCommand(
  deviceId: string,
  command: string
): Promise<{ success: boolean }> {
  return restRequest<{ success: boolean }>(`/devices/${deviceId}/actions/${command}`, {
    method: 'POST',
  });
}

export async function getTelemetryHistory(deviceId: string): Promise<TelemetrySample[]> {
  const data = await restRequest<{ telemetry: TelemetrySample[] }>(
    `/devices/${deviceId}/telemetry`
  );
  return data.telemetry;
}

export async function getWorkloads(): Promise<Workload[]> {
  const data = await restRequest<{ workloads: Workload[] }>('/workloads');
  return data.workloads;
}

export async function getWorkflows(): Promise<Workflow[]> {
  const data = await restRequest<{ workflows: Workflow[] }>('/workflows');
  return data.workflows;
}

export async function getWorkflowById(id: string): Promise<Workflow> {
  const data = await restRequest<{ workflow: Workflow }>(`/workflows/${id}`);
  return data.workflow;
}

export async function getWorkflowExecutions(workflowId: string): Promise<any[]> {
  const data = await trpcClient.workflow.executions.query({ workflowId });
  return data.executions;
}

export async function getAlerts(): Promise<Alert[]> {
  const data = await restRequest<{ alerts: Alert[] }>('/alerts');
  return data.alerts;
}

export async function resolveAlert(alertId: string): Promise<Alert> {
  const data = await restRequest<{ alert: Alert }>(`/alerts/${alertId}/resolve`, {
    method: 'POST',
  });
  return data.alert;
}

export async function getApplications(): Promise<Application[]> {
  const data = await restRequest<{ applications: Application[] }>('/applications');
  return data.applications;
}

export async function getFleetMetrics(): Promise<FleetMetrics> {
  return restRequest<FleetMetrics>('/analytics/fleet-metrics');
}

export async function getHealthMetrics(): Promise<HealthMetrics> {
  return restRequest<HealthMetrics>('/analytics/health-metrics');
}

export async function getRegionalMetrics(): Promise<RegionalMetrics[]> {
  return restRequest<RegionalMetrics[]>('/analytics/regional-metrics');
}

export async function getRecommendations(): Promise<Recommendation[]> {
  const data = await restRequest<{ recommendations: Recommendation[] }>(
    '/intelligence/recommendations'
  );
  return data.recommendations;
}

export async function getAuditLog(): Promise<AuditLogEntry[]> {
  const data = await restRequest<{ entries: AuditLogEntry[] }>('/audit-log');
  return data.entries;
}
