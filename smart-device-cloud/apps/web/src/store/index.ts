import type { Device, TelemetrySample, Alert } from '@smart-device-cloud/shared';

export interface FleetStore {
  devices: Device[];
  setDevices: (devices: Device[]) => void;
  updateDevice: (deviceId: string, updates: Partial<Device>) => void;
  upsertDevice: (device: Device) => void;
  removeDevice: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: {
    status: string[];
    manufacturers: string[];
    androidVersions: string[];
    regions: string[];
    workloads: string[];
    healthStatus: string[];
    batteryRange: { min: number; max: number };
    temperatureRange: { min: number; max: number };
    lastHeartbeatRange: { min: string; max: string };
  };
  setFilters: (
    filters: Partial<{
      status: string[];
      manufacturers: string[];
      androidVersions: string[];
      regions: string[];
      workloads: string[];
      healthStatus: string[];
      batteryRange: { min: number; max: number };
      temperatureRange: { min: number; max: number };
      lastHeartbeatRange: { min: string; max: string };
    }>
  ) => void;
  clearFilters: () => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  selectedDeviceIds: string[];
  toggleDeviceSelection: (deviceId: string) => void;
  selectAllDevices: () => void;
  clearSelection: () => void;
  regionFilter: string | null;
  setRegionFilter: (region: string | null) => void;
  filteredAndSortedDevices: Device[];
}

export interface TelemetryStore {
  latestByDevice: Record<string, TelemetrySample>;
  setLatest: (sample: TelemetrySample) => void;
  setMany: (samples: TelemetrySample[]) => void;
  clear: () => void;
}

export interface AlertStore {
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  resolveAlert: (id: string) => void;
}

export interface UIStore {
  drawerDeviceId: string | null;
  isDrawerOpen: boolean;
  openDrawer: (deviceId: string) => void;
  closeDrawer: () => void;
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  wsConnected: boolean;
  setWsConnected: (connected: boolean) => void;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}
