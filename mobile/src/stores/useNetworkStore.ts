import { create } from 'zustand';
import { networkMonitor } from '@/services/NetworkMonitor';
import { storageService } from '@/services/StorageService';
import type { NetworkState, QueuedRequest } from '@/types';

interface NetworkStoreState extends NetworkState {
  offlineQueue: QueuedRequest[];
}

interface NetworkStoreActions {
  addToQueue: (request: QueuedRequest) => Promise<void>;
  processQueue: () => Promise<void>;
  clearQueue: () => Promise<void>;
  updateNetworkState: (state: NetworkState) => void;
}

type NetworkStore = NetworkStoreState & NetworkStoreActions;

export const useNetworkStore = create<NetworkStore>()((set, get) => ({
  isConnected: true,
  isInternetReachable: null,
  type: 'unknown',
  isOnline: true,
  connectionType: 'unknown',
  offlineQueue: [],

  addToQueue: async (request: QueuedRequest) => {
    await storageService.addToOfflineQueue(request);
    set(state => ({
      offlineQueue: [...state.offlineQueue, request],
    }));
  },

  processQueue: async () => {
    const queue = await storageService.getOfflineQueue();
    if (queue.length === 0) return;

    const { isConnected } = get();
    if (!isConnected) return;

    for (const request of queue) {
      try {
        const { apiService } = await import('@/services/APIService');
        if (request.method === 'GET') {
          await apiService.get(request.url);
        } else if (request.method === 'POST') {
          await apiService.post(request.url, request.data);
        } else if (request.method === 'PUT') {
          await apiService.put(request.url, request.data);
        } else if (request.method === 'DELETE') {
          await apiService.delete(request.url);
        }
        await storageService.removeFromOfflineQueue(request.id);
        set(state => ({
          offlineQueue: state.offlineQueue.filter(req => req.id !== request.id),
        }));
      } catch (error) {
        console.error('[NetworkStore] Failed to process queued request:', error);
      }
    }
  },

  clearQueue: async () => {
    await storageService.clearOfflineQueue();
    set({ offlineQueue: [] });
  },

  updateNetworkState: (state: NetworkState) => {
    set(current => ({
      ...current,
      ...state,
      offlineQueue: get().offlineQueue,
    }));
  },
}));

networkMonitor.subscribe(state => {
  useNetworkStore.getState().updateNetworkState(state);
});
