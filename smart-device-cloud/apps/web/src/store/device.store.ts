import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Device } from '@smart-device-cloud/shared';

interface DeviceState {
  devices: Device[];
  selectedDevice: Device | null;
  setDevices: (devices: Device[]) => void;
  updateDevice: (device: Device) => void;
  removeDevice: (id: string) => void;
  setSelectedDevice: (device: Device | null) => void;
  getDeviceById: (id: string) => Device | undefined;
}

export const useDeviceStore = create<DeviceState>()(
  devtools((set, get) => ({
    devices: [],
    selectedDevice: null,
    setDevices: devices => set({ devices }),
    updateDevice: device =>
      set(state => ({
        devices: state.devices.map(d => (d.id === device.id ? device : d)),
      })),
    removeDevice: id =>
      set(state => ({
        devices: state.devices.filter(d => d.id !== id),
      })),
    setSelectedDevice: device => set({ selectedDevice: device }),
    getDeviceById: id => (get() as DeviceState).devices.find(d => d.id === id),
  }))
);
