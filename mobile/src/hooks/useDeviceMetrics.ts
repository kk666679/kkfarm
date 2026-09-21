import { useEffect, useRef, useState } from 'react';
import { Device } from '@/types';

export function useDeviceMetrics(deviceId: string | undefined) {
  const [metrics, setMetrics] = useState({
    cpuUsage: 0,
    memoryUsage: 0,
    batteryLevel: 100,
    temperature: 25,
    storageUsage: 0,
    networkLatency: 0,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!deviceId) return;

    const updateMetrics = () => {
      setMetrics(prev => ({
        cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 20)),
        memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 10)),
        batteryLevel: Math.max(0, Math.min(100, prev.batteryLevel - Math.random() * 2)),
        temperature: Math.max(20, Math.min(50, prev.temperature + (Math.random() - 0.5) * 4)),
        storageUsage: Math.max(0, Math.min(100, prev.storageUsage + Math.random() * 2)),
        networkLatency: Math.max(5, prev.networkLatency + (Math.random() - 0.5) * 20),
      }));
    };

    intervalRef.current = setInterval(updateMetrics, 2000);
    updateMetrics();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [deviceId]);

  return metrics;
}
