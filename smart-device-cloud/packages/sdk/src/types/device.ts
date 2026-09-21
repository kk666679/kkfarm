export type DeviceStatus = 'online' | 'offline' | 'busy' | 'maintenance' | 'unknown';

export interface Device {
  id: string;
  name: string;
  status: DeviceStatus;
  provider?: string;
  serial?: string;
  androidVersion?: string;
  apiLevel?: number;
  groupId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceListParams {
  status?: DeviceStatus;
  region?: string;
  limit?: number;
  offset?: number;
}
