import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  devtools(
    persist(
      set => ({
        isOpen: true,
        toggle: () => set(state => ({ isOpen: !state.isOpen })),
        open: () => set({ isOpen: true }),
        close: () => set({ isOpen: false }),
      }),
      { name: 'sidebar-store' }
    )
  )
);

export function useSidebar() {
  const { isOpen, toggle, open, close } = useSidebarStore();
  return { isOpen, toggle, open, close };
}