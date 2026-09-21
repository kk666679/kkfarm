import { useQuery } from '@tanstack/react-query';
import { cloudService, type Device } from '@/services/api';

export function useDevices(options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: ['dashboard', 'devices'],
    queryFn: () => cloudService.getDevices(),
    refetchInterval: options?.refetchInterval ?? 30000,
  });
}

export function useDevice(id: string) {
  return useQuery({
    queryKey: ['dashboard', 'device', id],
    queryFn: async () => {
      const devices = await cloudService.getDevices();
      return devices.find((d: Device) => d.id === id);
    },
    enabled: !!id,
  });
}
