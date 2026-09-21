import { useEffect, useState } from 'react';
import { Device } from '@/types';

export function useDeviceFilters() {
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [platformFilters, setPlatformFilters] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');

  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const togglePlatformFilter = (platform: string) => {
    setPlatformFilters(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const clearFilters = () => {
    setStatusFilters([]);
    setPlatformFilters([]);
    setSearchText('');
  };

  const filterDevices = (devices: Device[]): Device[] => {
    return devices.filter(device => {
      if (statusFilters.length > 0 && !statusFilters.includes(device.status)) {
        return false;
      }
      if (platformFilters.length > 0 && !platformFilters.includes(device.platform)) {
        return false;
      }
      if (searchText && !device.name.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }
      return true;
    });
  };

  return {
    statusFilters,
    platformFilters,
    searchText,
    toggleStatusFilter,
    togglePlatformFilter,
    setSearchText,
    clearFilters,
    filterDevices,
  };
}
