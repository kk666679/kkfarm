import { create } from 'zustand';

interface GlobalLoadingState {
  loaders: Record<string, number>;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  isLoading: (key: string) => boolean;
}

export const useGlobalLoading = create<GlobalLoadingState>((set, get, api) => ({
  loaders: {},
  startLoading: (key: string) => {
    set(state => ({
      loaders: {
        ...state.loaders,
        [key]: (state.loaders[key] || 0) + 1,
      },
    }));
  },
  stopLoading: (key: string) => {
    set(state => {
      const current = state.loaders[key] || 0;
      if (current <= 1) {
        const { [key]: _, ...rest } = state.loaders;
        return { loaders: rest };
      }
      return {
        loaders: {
          ...state.loaders,
          [key]: current - 1,
        },
      };
    });
  },
  isLoading: (key: string) => {
    return (get().loaders[key] || 0) > 0;
  },
}));
