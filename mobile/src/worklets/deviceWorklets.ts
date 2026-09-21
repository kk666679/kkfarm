import { runOnUI } from 'react-native-worklets';

export const processDeviceMetrics = (devices: any[]): any[] => {
  'worklet';
  return devices.map(device => ({
    ...device,
    cpuUsage: device.cpuUsage || 0,
    memoryUsage: device.memory || 0,
    batteryLevel: device.batteryLevel || 0,
  }));
};

export const filterDevicesWorklet = (
  devices: any[],
  filters: { search?: string; status?: string[]; platform?: string }
): any[] => {
  'worklet';
  return devices.filter(device => {
    if (filters.search && !device.name.toLowerCase().includes(filters.search.toLowerCase()))
      return false;
    if (filters.status && filters.status.length > 0 && !filters.status.includes(device.status))
      return false;
    if (filters.platform && device.platform !== filters.platform) return false;
    return true;
  });
};

export const runOnUIThread = <T, R>(fn: (data: T) => R, data: T): R => {
  'worklet';
  return runOnUI(fn)(data);
};

export default {
  processDeviceMetrics,
  filterDevicesWorklet,
};
