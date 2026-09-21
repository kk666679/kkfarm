import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { apiService } from '@/services/APIService';
import { useDeviceStore } from '@/stores';
import { useFarmStore } from '@/stores';
import type { Device, Task, SystemMetrics, DeviceDetails } from '@/types';

export const useDevicesQuery = (filters?: { status?: string[]; search?: string }) => {
  return useQuery({
    queryKey: ['devices', filters],
    queryFn: async () => {
      const devices = await apiService.getDevices();
      return devices;
    },
    staleTime: 30000,
  });
};

export const useDeviceQuery = (deviceId: string) => {
  return useQuery({
    queryKey: ['device', deviceId],
    queryFn: async () => {
      return apiService.getDevice(deviceId);
    },
    enabled: !!deviceId,
    staleTime: 30000,
  });
};

export const useTasksQuery = (filters?: {
  status?: string[];
  type?: string[];
  deviceId?: string;
}) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      return apiService.getTasks();
    },
    staleTime: 30000,
  });
};

export const useTaskQuery = (taskId: string) => {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      return apiService.getTask(taskId);
    },
    enabled: !!taskId,
    staleTime: 30000,
  });
};

export const useMetricsQuery = () => {
  return useQuery({
    queryKey: ['metrics'],
    queryFn: async () => {
      return apiService.getMetrics();
    },
    staleTime: 10000,
    refetchInterval: 10000,
  });
};

export const useLogsQuery = (deviceId: string, params?: { filter?: string; maxLines?: number }) => {
  return useQuery({
    queryKey: ['logs', deviceId, params],
    queryFn: async () => {
      return apiService.getLogs(deviceId, params?.filter, params?.maxLines || 200);
    },
    enabled: !!deviceId,
    staleTime: 15000,
    refetchInterval: 15000,
  });
};
