import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Device, DeviceStatus, Platform, DeviceRegistrationData } from '@/types';
import { apiService, wsService } from '@/services';

interface DeviceState {
  devices: Device[];
  filteredDevices: Device[];
  searchText: string;
  statusFilters: DeviceStatus[];
  platformFilter: Platform | 'All';
  isLoading: boolean;
  lastUpdate: Date | null;
  error: string | null;
}

type DeviceAction =
  | { type: 'FETCH_REQUEST' }
  | { type: 'FETCH_SUCCESS'; payload: Device[] }
  | { type: 'FETCH_FAILURE'; payload: string }
  | { type: 'REGISTER_SUCCESS'; payload: Device }
  | {
      type: 'UPDATE_STATUS';
      payload: { deviceId: string; status: DeviceStatus; batteryLevel?: number };
    }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_STATUS_FILTERS'; payload: DeviceStatus[] }
  | { type: 'SET_PLATFORM_FILTER'; payload: Platform | 'All' }
  | { type: 'CLEAR_FILTERS' };

interface DeviceContextValue {
  state: DeviceState;
  fetchDevices: () => Promise<void>;
  registerDevice: (data: DeviceRegistrationData) => Promise<void>;
  updateDeviceStatus: (deviceId: string, status: DeviceStatus) => void;
  setSearchText: (text: string) => void;
  setStatusFilters: (filters: DeviceStatus[]) => void;
  setPlatformFilter: (platform: Platform | 'All') => void;
  clearFilters: () => void;
}

const initialState: DeviceState = {
  devices: [],
  filteredDevices: [],
  searchText: '',
  statusFilters: [],
  platformFilter: 'All',
  isLoading: false,
  lastUpdate: null,
  error: null,
};

const filterDevices = (
  devices: Device[],
  searchText: string,
  statusFilters: DeviceStatus[],
  platformFilter: Platform | 'All'
): Device[] => {
  return devices.filter(device => {
    const matchesSearch =
      searchText === '' ||
      device.name.toLowerCase().includes(searchText.toLowerCase()) ||
      device.id.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(device.status);
    const matchesPlatform = platformFilter === 'All' || device.platform === platformFilter;
    return matchesSearch && matchesStatus && matchesPlatform;
  });
};

const deviceReducer = (state: DeviceState, action: DeviceAction): DeviceState => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS': {
      const filtered = filterDevices(
        action.payload,
        state.searchText,
        state.statusFilters,
        state.platformFilter
      );
      return {
        ...state,
        devices: action.payload,
        filteredDevices: filtered,
        isLoading: false,
        lastUpdate: new Date(),
      };
    }
    case 'FETCH_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'REGISTER_SUCCESS': {
      const newDevices = [...state.devices, action.payload];
      const filtered = filterDevices(
        newDevices,
        state.searchText,
        state.statusFilters,
        state.platformFilter
      );
      return { ...state, devices: newDevices, filteredDevices: filtered };
    }
    case 'UPDATE_STATUS': {
      const updated = state.devices.map(d =>
        d.id === action.payload.deviceId
          ? {
              ...d,
              status: action.payload.status,
              batteryLevel: action.payload.batteryLevel || d.batteryLevel,
            }
          : d
      );
      const filtered = filterDevices(
        updated,
        state.searchText,
        state.statusFilters,
        state.platformFilter
      );
      return { ...state, devices: updated, filteredDevices: filtered };
    }
    case 'SET_SEARCH': {
      const filtered = filterDevices(
        state.devices,
        action.payload,
        state.statusFilters,
        state.platformFilter
      );
      return { ...state, searchText: action.payload, filteredDevices: filtered };
    }
    case 'SET_STATUS_FILTERS': {
      const filtered = filterDevices(
        state.devices,
        state.searchText,
        action.payload,
        state.platformFilter
      );
      return { ...state, statusFilters: action.payload, filteredDevices: filtered };
    }
    case 'SET_PLATFORM_FILTER': {
      const filtered = filterDevices(
        state.devices,
        state.searchText,
        state.statusFilters,
        action.payload
      );
      return { ...state, platformFilter: action.payload, filteredDevices: filtered };
    }
    case 'CLEAR_FILTERS': {
      const filtered = filterDevices(state.devices, '', [], 'All');
      return {
        ...state,
        searchText: '',
        statusFilters: [],
        platformFilter: 'All',
        filteredDevices: filtered,
      };
    }
    default:
      return state;
  }
};

const DeviceContext = createContext<DeviceContextValue | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(deviceReducer, initialState);

  useEffect(() => {
    fetchDevices();
    const unsubscribe = wsService.subscribe('devices', message => {
      if (message.type === 'update' && message.payload) {
        dispatch({
          type: 'UPDATE_STATUS',
          payload: {
            deviceId: message.payload.deviceId,
            status: message.payload.status,
            batteryLevel: message.payload.batteryLevel,
          },
        });
      }
    });
    return unsubscribe;
  }, []);

  const fetchDevices = async () => {
    dispatch({ type: 'FETCH_REQUEST' });
    try {
      const devices = await apiService.getDevices();
      dispatch({ type: 'FETCH_SUCCESS', payload: devices });
    } catch (error: any) {
      dispatch({ type: 'FETCH_FAILURE', payload: error.message });
    }
  };

  const registerDevice = async (data: DeviceRegistrationData) => {
    const device = await apiService.registerDevice(data);
    dispatch({ type: 'REGISTER_SUCCESS', payload: device });
  };

  const updateDeviceStatus = (deviceId: string, status: DeviceStatus) => {
    dispatch({ type: 'UPDATE_STATUS', payload: { deviceId, status } });
  };

  const setSearchText = (text: string) => dispatch({ type: 'SET_SEARCH', payload: text });
  const setStatusFilters = (filters: DeviceStatus[]) =>
    dispatch({ type: 'SET_STATUS_FILTERS', payload: filters });
  const setPlatformFilter = (platform: Platform | 'All') =>
    dispatch({ type: 'SET_PLATFORM_FILTER', payload: platform });
  const clearFilters = () => dispatch({ type: 'CLEAR_FILTERS' });

  return (
    <DeviceContext.Provider
      value={{
        state,
        fetchDevices,
        registerDevice,
        updateDeviceStatus,
        setSearchText,
        setStatusFilters,
        setPlatformFilter,
        clearFilters,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevices = (): DeviceContextValue => {
  const context = useContext(DeviceContext);
  if (!context) throw new Error('useDevices must be used within DeviceProvider');
  return context;
};

export default DeviceContext;
