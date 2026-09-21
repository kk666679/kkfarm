import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Device, CloudRegion, DeviceFilters, SortOption } from '@smart-device-cloud/shared';

interface FleetState {
  devices: Device[];
  setDevices: (devices: Device[]) => void;
  updateDevice: (deviceId: string, updates: Partial<Device>) => void;
  upsertDevice: (device: Device) => void;
  removeDevice: (id: string) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  filters: DeviceFilters;
  setFilters: (filters: Partial<DeviceFilters>) => void;
  clearFilters: () => void;

  sortBy: SortOption;
  setSortBy: (sortBy: SortOption) => void;

  selectedDeviceIds: string[];
  toggleDeviceSelection: (deviceId: string) => void;
  selectAllDevices: () => void;
  clearSelection: () => void;

  regionFilter: CloudRegion | null;
  setRegionFilter: (region: CloudRegion | null) => void;

  filteredAndSortedDevices: Device[];
}

export const useFleetStore = create<FleetState>()(
  devtools((set, get) => ({
    devices: [],
    setDevices: devices => set({ devices }),
    updateDevice: (deviceId, updates) =>
      set(state => ({
        devices: state.devices.map(d => (d.id === deviceId ? { ...d, ...updates } : d)),
      })),
    upsertDevice: device =>
      set(state => {
        const exists = state.devices.some(d => d.id === device.id);
        if (exists) {
          return {
            devices: state.devices.map(d => (d.id === device.id ? device : d)),
          };
        }
        return { devices: [...state.devices, device] };
      }),
    removeDevice: id =>
      set(state => ({
        devices: state.devices.filter(d => d.id !== id),
        selectedDeviceIds: state.selectedDeviceIds.filter(sid => sid !== id),
      })),

    searchQuery: '',
    setSearchQuery: searchQuery => set({ searchQuery }),

    filters: {
      status: [],
      manufacturers: [],
      androidVersions: [],
      regions: [],
      workloads: [],
      healthStatus: [],
      batteryRange: { min: 0, max: 100 },
      temperatureRange: { min: 0, max: 100 },
      lastHeartbeatRange: { min: '', max: '' },
    },
    setFilters: filters =>
      set(state => ({
        filters: { ...state.filters, ...filters },
      })),
    clearFilters: () =>
      set({
        filters: {
          status: [],
          manufacturers: [],
          androidVersions: [],
          regions: [],
          workloads: [],
          healthStatus: [],
          batteryRange: { min: 0, max: 100 },
          temperatureRange: { min: 0, max: 100 },
          lastHeartbeatRange: { min: '', max: '' },
        },
        searchQuery: '',
        regionFilter: null,
      }),

    sortBy: 'health_desc',
    setSortBy: sortBy => set({ sortBy }),

    selectedDeviceIds: [],
    toggleDeviceSelection: deviceId =>
      set(state => ({
        selectedDeviceIds: state.selectedDeviceIds.includes(deviceId)
          ? state.selectedDeviceIds.filter(id => id !== deviceId)
          : [...state.selectedDeviceIds, deviceId],
      })),
    selectAllDevices: () =>
      set(state => ({
        selectedDeviceIds: state.devices.map(d => d.id),
      })),
    clearSelection: () => set({ selectedDeviceIds: [] }),

    regionFilter: null,
    setRegionFilter: regionFilter => set({ regionFilter }),

    get filteredAndSortedDevices() {
      const { devices, searchQuery, filters, sortBy, regionFilter } = get() as FleetState;
      const numericValue = (value?: number) => value ?? 0;
      let result = [...devices];

      if (regionFilter) {
        result = result.filter(d => d.region === regionFilter);
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        result = result.filter(d => {
          const manufacturer = d.manufacturer?.toLowerCase() ?? '';
          const model = d.model?.toLowerCase() ?? '';
          const name = d.name.toLowerCase();
          const id = d.id.toLowerCase();
          return (
            name.includes(q) || id.includes(q) || manufacturer.includes(q) || model.includes(q)
          );
        });
      }

      if (filters.status?.length) {
        const statusFilter = filters.status;
        result = result.filter(d => statusFilter.includes(d.status));
      }

      if (filters.manufacturers?.length) {
        result = result.filter(
          d => d.manufacturer !== undefined && filters.manufacturers?.includes(d.manufacturer)
        );
      }

      if (filters.androidVersions?.length) {
        result = result.filter(
          d => d.androidVersion !== undefined && filters.androidVersions?.includes(d.androidVersion)
        );
      }

      if (filters.regions?.length) {
        result = result.filter(d => d.region !== undefined && filters.regions?.includes(d.region));
      }

      if (filters.workloads?.length) {
        result = result.filter(d => filters.workloads?.includes(d.currentWorkloadName ?? ''));
      }

      if (filters.batteryRange) {
        result = result.filter(d => {
          const value = numericValue(d.batteryLevel);
          return (
            value >= (filters.batteryRange?.min ?? 0) && value <= (filters.batteryRange?.max ?? 100)
          );
        });
      }

      if (filters.temperatureRange) {
        result = result.filter(d => {
          const value = numericValue(d.temperature);
          return (
            value >= (filters.temperatureRange?.min ?? 0) &&
            value <= (filters.temperatureRange?.max ?? 100)
          );
        });
      }

      result.sort((a, b) => {
        switch (sortBy) {
          case 'health_asc':
            return numericValue(a.batteryLevel) - numericValue(b.batteryLevel);
          case 'health_desc':
            return numericValue(b.batteryLevel) - numericValue(a.batteryLevel);
          case 'cpu_asc':
            return numericValue(a.cpuUsage) - numericValue(b.cpuUsage);
          case 'cpu_desc':
            return numericValue(b.cpuUsage) - numericValue(a.cpuUsage);
          case 'memory_asc':
            return numericValue(a.memoryUsage) - numericValue(b.memoryUsage);
          case 'memory_desc':
            return numericValue(b.memoryUsage) - numericValue(a.memoryUsage);
          case 'battery_asc':
            return numericValue(a.batteryLevel) - numericValue(b.batteryLevel);
          case 'battery_desc':
            return numericValue(b.batteryLevel) - numericValue(a.batteryLevel);
          case 'temp_asc':
            return numericValue(a.temperature) - numericValue(b.temperature);
          case 'temp_desc':
            return numericValue(b.temperature) - numericValue(a.temperature);
          case 'last_seen_asc':
            return (
              new Date(a.lastHeartbeat ?? 0).getTime() - new Date(b.lastHeartbeat ?? 0).getTime()
            );
          case 'last_seen_desc':
            return (
              new Date(b.lastHeartbeat ?? 0).getTime() - new Date(a.lastHeartbeat ?? 0).getTime()
            );
          case 'workload_asc':
            return (a.currentWorkloadName ?? '').localeCompare(b.currentWorkloadName ?? '');
          case 'workload_desc':
            return (b.currentWorkloadName ?? '').localeCompare(a.currentWorkloadName ?? '');
          case 'age_asc':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'age_desc':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default:
            return 0;
        }
      });

      return result;
    },
  }))
);
