import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { SystemMetrics, LogEntry, CommandResult } from '@/types';
import { apiService } from '@/services';

interface FarmState {
  metrics: SystemMetrics | null;
  circuitBreakerOpen: boolean;
  maintenanceModeEnabled: boolean;
  logs: LogEntry[];
  isLoading: boolean;
  error: string | null;
}

type FarmAction =
  | { type: 'SET_METRICS'; payload: SystemMetrics }
  | { type: 'UPDATE_CIRCUIT_BREAKER'; payload: boolean }
  | { type: 'UPDATE_MAINTENANCE_MODE'; payload: boolean }
  | { type: 'SET_LOGS'; payload: LogEntry[] }
  | { type: 'ERROR'; payload: string };

interface FarmContextValue {
  state: FarmState;
  fetchMetrics: () => Promise<void>;
  toggleCircuitBreaker: (open: boolean) => Promise<void>;
  toggleMaintenanceMode: (enabled: boolean) => Promise<void>;
  fetchLogs: (count?: number) => Promise<void>;
  sendCommand: (command: string) => Promise<CommandResult>;
}

const initialState: FarmState = {
  metrics: null,
  circuitBreakerOpen: false,
  maintenanceModeEnabled: false,
  logs: [],
  isLoading: false,
  error: null,
};

const farmReducer = (state: FarmState, action: FarmAction): FarmState => {
  switch (action.type) {
    case 'SET_METRICS':
      return { ...state, metrics: action.payload };
    case 'UPDATE_CIRCUIT_BREAKER':
      return { ...state, circuitBreakerOpen: action.payload };
    case 'UPDATE_MAINTENANCE_MODE':
      return { ...state, maintenanceModeEnabled: action.payload };
    case 'SET_LOGS':
      return { ...state, logs: action.payload };
    case 'ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const FarmContext = createContext<FarmContextValue | undefined>(undefined);

export const FarmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(farmReducer, initialState);

  const fetchMetrics = async () => {
    try {
      const metrics = await apiService.getMetrics();
      dispatch({ type: 'SET_METRICS', payload: metrics });
    } catch (error: any) {
      dispatch({ type: 'ERROR', payload: error.message });
    }
  };

  const toggleCircuitBreaker = async (open: boolean) => {
    await apiService.setCircuitBreaker(open);
    dispatch({ type: 'UPDATE_CIRCUIT_BREAKER', payload: open });
  };

  const toggleMaintenanceMode = async (enabled: boolean) => {
    await apiService.setMaintenanceMode(enabled);
    dispatch({ type: 'UPDATE_MAINTENANCE_MODE', payload: enabled });
  };

  const fetchLogs = async (count: number = 100) => {
    const logs = await apiService.getLogs(count);
    dispatch({ type: 'SET_LOGS', payload: logs });
  };

  const sendCommand = async (command: string): Promise<CommandResult> => {
    return await apiService.sendCommand(command);
  };

  return (
    <FarmContext.Provider
      value={{
        state,
        fetchMetrics,
        toggleCircuitBreaker,
        toggleMaintenanceMode,
        fetchLogs,
        sendCommand,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = (): FarmContextValue => {
  const context = useContext(FarmContext);
  if (!context) throw new Error('useFarm must be used within FarmProvider');
  return context;
};

export default FarmContext;
