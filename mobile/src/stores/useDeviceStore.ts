import { create } from 'zustand';
import { apiService } from '@/services/APIService';
import { storageService } from '@/services/StorageService';
import { wsService } from '@/services/WebSocketService';
import { useGlobalLoading } from './useGlobalLoading';
import type { Device, DeviceStatus } from '@/types';

interface DeviceState {
  devices: Device[];
  filteredDevices: Device[];
  searchText: string;
  statusFilters: DeviceStatus[];
  lastUpdate: number | null;
  error: string | null;
  isLoading: boolean;
}

interface DeviceActions {
  fetchDevices: () => Promise<void>;
  registerDevice: (deviceData: Partial<Device>) => Promise<Device>;
  setSearchText: (text: string) => void;
  setStatusFilters: (filters: DeviceStatus[]) => void;
  clearFilters: () => void;
  updateDevice: (device: Device) => void;
  applyFilters: () => void;
}

type DeviceStore = DeviceState & DeviceActions;

export const useDeviceStore = create<DeviceStore>()((set, get) => ({
  devices: [],
  filteredDevices: [],
  searchText: '',
  statusFilters: [],
  lastUpdate: null,
  error: null,
  isLoading: false,

  fetchDevices: async () => {
    const { startLoading, stopLoading } = useGlobalLoading.getState();
    startLoading('devices-fetch');
    try {
      const devices = await apiService.getDevices();
      await storageService.cacheDevices(devices);
      set({ devices, filteredDevices: devices, lastUpdate: Date.now(), error: null });
    } catch (error: any) {
      const cached = await storageService.getCachedDevices();
      if (cached) {
        set({ devices: cached.data, filteredDevices: cached.data, error: 'Using cached data' });
      } else {
        set({ error: error.message || 'Failed to fetch devices' });
      }
    } finally {
      stopLoading('devices-fetch');
    }
  },

  registerDevice: async (deviceData: Partial<Device>) => {
    const { startLoading, stopLoading } = useGlobalLoading.getState();
    startLoading('device-register');
    try {
      const device = await apiService.createDevice(deviceData);
      set(state => ({
        devices: [...state.devices, device],
        filteredDevices: [...state.filteredDevices, device],
      }));
      return device;
    } finally {
      stopLoading('device-register');
    }
  },

  setSearchText: (text: string) => {
    set({ searchText: text });
    get().applyFilters();
  },

  setStatusFilters: (filters: DeviceStatus[]) => {
    set({ statusFilters: filters });
    get().applyFilters();
  },

  clearFilters: () => {
    set({ searchText: '', statusFilters: [] });
    get().applyFilters();
  },

  updateDevice: (device: Device) => {
    set(state => ({
      devices: state.devices.map(d => (d.id === device.id ? device : d)),
      filteredDevices: state.filteredDevices.map(d => (d.id === device.id ? device : d)),
    }));
  },

  applyFilters: () => {
    const { devices, searchText, statusFilters } = get();
    let filtered = devices;

    if (searchText.trim()) {
      const lower = searchText.toLowerCase();
      filtered = filtered.filter(
        d => d.name.toLowerCase().includes(lower) || d.id.toLowerCase().includes(lower)
      );
    }

    if (statusFilters.length > 0) {
      filtered = filtered.filter(d => statusFilters.includes(d.status));
    }

    set({ filteredDevices: filtered });
  },
}));

wsService.subscribe('devices', (message: any) => {
  if (message.type === 'update' && message.channel === 'devices') {
    const payload = message.payload as {
      deviceId: string;
      status?: string;
      batteryLevel?: number;
      lastSeen?: string;
    };
    if (payload.deviceId && payload.status) {
      useDeviceStore.getState().updateDevice({
        id: payload.deviceId,
        name: '',
        provider: '',
        status: payload.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(payload.batteryLevel !== undefined ? { batteryLevel: payload.batteryLevel } : {}),
        ...(payload.lastSeen !== undefined ? { lastSeen: payload.lastSeen } : {}),
      } as Device);
    }
  }
});
