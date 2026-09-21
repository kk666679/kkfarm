import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Notification } from './index';

interface UIState {
  drawerDeviceId: string | null;
  isDrawerOpen: boolean;
  openDrawer: (deviceId: string) => void;
  closeDrawer: () => void;
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  wsConnected: boolean;
  setWsConnected: (connected: boolean) => void;
}

export const useUIStore = create<UIState>()(
  devtools((set, _get) => ({
    drawerDeviceId: null,
    isDrawerOpen: false,
    openDrawer: deviceId => set({ drawerDeviceId: deviceId, isDrawerOpen: true }),
    closeDrawer: () => set({ drawerDeviceId: null, isDrawerOpen: false }),
    notifications: [],
    addNotification: notification =>
      set(state => ({
        notifications: [...state.notifications, notification],
      })),
    removeNotification: id =>
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== id),
      })),
    wsConnected: false,
    setWsConnected: wsConnected => set({ wsConnected }),
  }))
);
