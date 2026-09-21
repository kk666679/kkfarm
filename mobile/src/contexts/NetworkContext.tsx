import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { networkMonitor } from '@/services';
import { ApiRequest } from '@/types';

interface NetworkState {
  isOnline: boolean;
  isConnected: boolean;
  connectionType: string | null;
  offlineQueue: ApiRequest[];
  queueSize: number;
}

type NetworkAction =
  | { type: 'SET_ONLINE'; payload: boolean }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_CONNECTION_TYPE'; payload: string | null }
  | { type: 'UPDATE_QUEUE'; payload: ApiRequest[] };

interface NetworkContextValue {
  state: NetworkState;
  retryQueue: () => Promise<void>;
  clearQueue: () => void;
}

const initialState: NetworkState = {
  isOnline: true,
  isConnected: true,
  connectionType: null,
  offlineQueue: [],
  queueSize: 0,
};

const networkReducer = (state: NetworkState, action: NetworkAction): NetworkState => {
  switch (action.type) {
    case 'SET_ONLINE':
      return { ...state, isOnline: action.payload };
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'SET_CONNECTION_TYPE':
      return { ...state, connectionType: action.payload };
    case 'UPDATE_QUEUE':
      return { ...state, offlineQueue: action.payload, queueSize: action.payload.length };
    default:
      return state;
  }
};

const NetworkContext = createContext<NetworkContextValue | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(networkReducer, initialState);

  useEffect(() => {
    const updateNetworkState = async () => {
      const status = await networkMonitor.getNetworkStatus();
      dispatch({ type: 'SET_ONLINE', payload: status.isOnline });
      dispatch({ type: 'SET_CONNECTED', payload: status.isConnected });
      dispatch({ type: 'SET_CONNECTION_TYPE', payload: status.connectionType });
    };

    updateNetworkState();
    const interval = setInterval(updateNetworkState, 5000);
    return () => clearInterval(interval);
  }, []);

  const retryQueue = async () => {
    console.log('[NetworkContext] Retrying offline queue');
  };

  const clearQueue = () => {
    dispatch({ type: 'UPDATE_QUEUE', payload: [] });
  };

  return (
    <NetworkContext.Provider value={{ state, retryQueue, clearQueue }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextValue => {
  const context = useContext(NetworkContext);
  if (!context) throw new Error('useNetwork must be used within NetworkProvider');
  return context;
};

export default NetworkContext;
