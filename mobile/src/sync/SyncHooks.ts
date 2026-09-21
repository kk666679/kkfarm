import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDatabase } from '@/storage/database';
import { storageService } from '@/services/StorageService';

export const useOfflineQueueStatus = () => {
  const { data: queue = [], ...rest } = useQuery({
    queryKey: ['offlineQueue'],
    queryFn: async () => {
      return storageService.getOfflineQueue();
    },
    staleTime: 5000,
  });

  return {
    queue,
    pendingCount: queue.length,
    ...rest,
  };
};

export const useLastSyncTimestamp = () => {
  return useQuery({
    queryKey: ['lastSyncTimestamp'],
    queryFn: async () => {
      return storageService.getLastSyncTimestamp();
    },
    staleTime: 30000,
  });
};

export const useCacheDevices = () => {
  return useQuery({
    queryKey: ['cachedDevices'],
    queryFn: async () => {
      return storageService.getCachedDevices();
    },
    staleTime: 30000,
  });
};

export const useCacheTasks = () => {
  return useQuery({
    queryKey: ['cachedTasks'],
    queryFn: async () => {
      return storageService.getCachedTasks();
    },
    staleTime: 30000,
  });
};

export const useCacheMetrics = () => {
  return useQuery({
    queryKey: ['cachedMetrics'],
    queryFn: async () => {
      return storageService.getCachedMetrics();
    },
    staleTime: 10000,
  });
};

export const useSQLiteQuery = <T>(tableName: string, query: string, params: any[] = []) => {
  return useQuery({
    queryKey: ['sqlite', tableName, query, params],
    queryFn: async () => {
      const db = await getDatabase();
      const results = (await db.getAllAsync(query, params)) as T[];
      return results;
    },
    staleTime: 5000,
  });
};

export const useMeridianMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
  }
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries();
      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables);
    },
  });
};
