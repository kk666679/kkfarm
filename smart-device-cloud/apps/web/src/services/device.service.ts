import { api } from '@/lib/api';
import type { Device, DeviceStatus } from '@smart-device-cloud/shared';

export type { Device } from '@smart-device-cloud/shared';

const normalizeStatus = (status: string | undefined): DeviceStatus => {
  if (
    status === 'available' ||
    status === 'in_use' ||
    status === 'maintenance' ||
    status === 'reserved'
  ) {
    return status as DeviceStatus;
  }
  return 'offline';
};

export interface DeviceStats {
  total: number;
  available: number;
  in_use: number;
  maintenance: number;
  offline: number;
  reserved: number;
  healthy: number;
  warning: number;
  critical: number;
  avg_battery: number;
  avg_temperature: number;
  avg_cpu_usage: number;
  avg_memory_usage: number;
  avg_storage_usage: number;
}

export interface DeviceFilters {
  status?: string;
  model?: string;
  provider?: string;
  search?: string;
  group?: string;
}

export interface DeviceProfileSection {
  model?: string;
  manufacturer?: string;
  androidVersion?: string;
  apiLevel?: number;
  screenSize?: string;
  resolution?: string;
  cpu?: string;
  ram?: string;
  storage?: string;
  battery?: string;
  cameras?: number;
  sensors?: string[];
  network?: 'wifi' | 'cellular' | 'ethernet';
}

export interface DeviceProfile {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
  isActive: boolean;
  category?: 'standard' | 'custom' | 'template';
  priority?: 'low' | 'medium' | 'high';
  applicableDevices?: string[];
  general?: {
    name?: string;
    description?: string;
    tags?: string[];
    category?: 'standard' | 'custom' | 'template';
    priority?: 'low' | 'medium' | 'high';
    applicableDevices?: string[];
  };
  device?: DeviceProfileSection;
  android?: Record<string, unknown>;
  locale?: Record<string, unknown>;
  timezone?: Record<string, unknown>;
  applications?: Record<string, unknown>;
  network?: Record<string, unknown>;
  startup?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ProfileVersion {
  id: string;
  version: number;
  changes: string;
  changedBy: string;
  changedAt: string;
  content: Record<string, unknown>;
}

export interface DeviceGroup {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  path: string;
  deviceCount: number;
  onlineCount: number;
  offlineCount: number;
  maintenanceCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  assignedTo?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface DeviceProvider {
  id: string;
  name: string;
  type: 'emulator' | 'real_device' | 'cloud';
  status: 'connected' | 'disconnected' | 'error';
  location?: string;
}

export interface ProvisioningResult {
  device: Device;
}

export const deviceService = {
  async getDevices(filters: DeviceFilters = {}): Promise<Device[]> {
    const res = await api.devices.list(filters as Record<string, string>);
    return res.devices;
  },

  async getDevice(id: string): Promise<Device> {
    const res = await api.devices.get(id);
    return res.device;
  },

  async createDevice(data: Partial<Device>): Promise<Device> {
    const res = await api.devices.create(data);
    return res.device;
  },

  async deleteDevice(id: string): Promise<void> {
    await api.devices.remove(id);
  },

  async getDeviceStats(): Promise<DeviceStats> {
    const devices = await this.getDevices();
    const stats: DeviceStats = {
      total: devices.length,
      available: 0,
      in_use: 0,
      maintenance: 0,
      offline: 0,
      reserved: 0,
      healthy: 0,
      warning: 0,
      critical: 0,
      avg_battery: 0,
      avg_temperature: 0,
      avg_cpu_usage: 0,
      avg_memory_usage: 0,
      avg_storage_usage: 0,
    };

    if (devices.length > 0) {
      let totalBattery = 0;
      let totalTemp = 0;
      let totalCpu = 0;
      let totalMemory = 0;
      let totalStorage = 0;

      devices.forEach(d => {
        const normalizedStatus = normalizeStatus(d.status);
        if (normalizedStatus === 'available') stats.available++;
        if (normalizedStatus === 'in_use' || normalizedStatus === 'busy') stats.in_use++;
        if (normalizedStatus === 'maintenance') stats.maintenance++;
        if (normalizedStatus === 'offline') stats.offline++;
        if (normalizedStatus === 'reserved') stats.reserved++;

        if (normalizedStatus === 'online' || normalizedStatus === 'available') stats.healthy++;
        else if (normalizedStatus === 'error') stats.critical++;
        else if (normalizedStatus === 'starting' || normalizedStatus === 'stopping')
          stats.warning++;

        totalBattery += (d as any).batteryLevel ?? 0;
        totalTemp += (d as any).temperature ?? 0;
        totalCpu += (d as any).cpuUsage ?? 0;
        totalMemory += (d as any).memoryUsage ?? 0;
        totalStorage += (d as any).storageUsage ?? 0;
      });

      stats.avg_battery = totalBattery / devices.length;
      stats.avg_temperature = totalTemp / devices.length;
      stats.avg_cpu_usage = totalCpu / devices.length;
      stats.avg_memory_usage = totalMemory / devices.length;
      stats.avg_storage_usage = totalStorage / devices.length;
    }

    return stats;
  },

  async getDeviceLogs(deviceId: string): Promise<{ logs: string }> {
    const res = await api.devices.logs(deviceId);
    return { logs: res.lines.join('\n') };
  },

  async sendCommand(deviceId: string, command: string, _payload?: any): Promise<void> {
    switch (command) {
      case 'start':
        await api.devices.start(deviceId);
        break;
      case 'stop':
        await api.devices.stop(deviceId);
        break;
      case 'restart':
        await api.devices.restart(deviceId);
        break;
      case 'reboot':
        await api.devices.restart(deviceId);
        break;
      case 'allocate':
        await api.devices.shell(deviceId, 'allocate');
        break;
      case 'release':
        await api.devices.shell(deviceId, 'release');
        break;
      case 'maintenance':
        await api.devices.shell(deviceId, 'maintenance');
        break;
      default:
        await api.devices.shell(deviceId, command);
    }
  },

  async getDeviceProfiles(): Promise<DeviceProfile[]> {
    const res = await api.deviceProfiles.list();
    return res.profiles;
  },

  async getDeviceProfile(id: string): Promise<DeviceProfile> {
    const res = await api.deviceProfiles.get(id);
    return res.profile;
  },

  async createDeviceProfile(data: Partial<DeviceProfile>): Promise<DeviceProfile> {
    const res = await api.deviceProfiles.create(data);
    return res.profile;
  },

  async updateDeviceProfile(id: string, data: Partial<DeviceProfile>): Promise<DeviceProfile> {
    const res = await api.deviceProfiles.update(id, data);
    return res.profile;
  },

  async deleteDeviceProfile(id: string): Promise<void> {
    await api.deviceProfiles.remove(id);
  },

  async publishDeviceProfile(id: string): Promise<DeviceProfile> {
    const res = await api.deviceProfiles.publish(id);
    return res.profile;
  },

  async duplicateDeviceProfile(id: string): Promise<DeviceProfile> {
    const res = await api.deviceProfiles.duplicate(id);
    return res.profile;
  },

  async getProfileVersions(id: string): Promise<ProfileVersion[]> {
    const res = await api.deviceProfiles.versions(id);
    return res.versions;
  },

  async restoreProfileVersion(id: string, versionId: string): Promise<DeviceProfile> {
    const res = await api.deviceProfiles.restore(id, versionId);
    return res.profile;
  },

  async compareProfileVersions(id: string, versionId: string): Promise<Record<string, unknown>> {
    const res = await api.deviceProfiles.compare(id, versionId);
    return res.comparison;
  },

  async getDeviceProviders(): Promise<DeviceProvider[]> {
    const res = await api.provisioning.providers();
    return res.providers;
  },

  async getAccounts(): Promise<any[]> {
    const res = await api.provisioning.accounts();
    return res.accounts;
  },

  async getApplications(): Promise<any[]> {
    const res = await api.provisioning.applications();
    return res.applications;
  },

  async provisionDevice(data: unknown): Promise<ProvisioningResult> {
    return api.provisioning.provision(data);
  },

  async getDeviceGroups(): Promise<DeviceGroup[]> {
    const res = await api.deviceGroups.list();
    return res.groups;
  },

  async getDeviceGroupStats(): Promise<Record<string, number>> {
    const res = await api.deviceGroups.stats();
    return res.stats;
  },

  async createDeviceGroup(data: Partial<DeviceGroup>): Promise<DeviceGroup> {
    const res = await api.deviceGroups.create(data);
    return res.group;
  },

  async updateDeviceGroup(id: string, data: Partial<DeviceGroup>): Promise<DeviceGroup> {
    const res = await api.deviceGroups.update(id, data);
    return res.group;
  },

  async deleteDeviceGroup(id: string): Promise<void> {
    await api.deviceGroups.remove(id);
  },

  async moveDeviceGroup(id: string, parentId?: string): Promise<DeviceGroup> {
    const res = await api.deviceGroups.move(id, parentId);
    return res.group;
  },
};
