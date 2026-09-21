import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/APIService';
import { useDeviceStore } from '@/stores/useDeviceStore';
import { useTaskStore } from '@/stores/useTaskStore';
import type { Device, Task } from '@/types';

export const useCreateDeviceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Device>) => apiService.createDevice(data),
    onSuccess: (device: Device) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      useDeviceStore.getState().updateDevice(device);
    },
  });
};

export const useDeleteDeviceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiService.deleteDevice(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};

export const useStartDeviceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiService.startDevice(id),
    onSuccess: (device: Device) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      useDeviceStore.getState().updateDevice(device);
    },
  });
};

export const useStopDeviceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiService.stopDevice(id),
    onSuccess: (device: Device) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      useDeviceStore.getState().updateDevice(device);
    },
  });
};

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskData: Partial<Task>) => apiService.createTask(taskData),
    onSuccess: (task: Task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      useTaskStore.getState().updateTask(task);
    },
  });
};

export const useCancelTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => apiService.cancelTask(taskId),
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useRetryTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => apiService.retryTask(taskId),
    onSuccess: (task: Task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      useTaskStore.getState().updateTask(task);
    },
  });
};
