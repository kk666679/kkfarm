import { useEffect, useState } from 'react';
import { Device, DeviceHealthStatus } from '@/types';

export function useDeviceHealth(device: Device | undefined) {
  const [health, setHealth] = useState<DeviceHealthStatus>('critical');
  const [healthScore, setHealthScore] = useState(0);

  useEffect(() => {
    if (!device) {
      setHealth('critical');
      setHealthScore(0);
      return;
    }

    let score = 100;
    if (device.batteryLevel < 20) score -= 30;
    if (device.cpuUsage && device.cpuUsage > 90) score -= 20;
    if (device.temperature && device.temperature > 45) score -= 15;
    if (device.networkLatency && device.networkLatency > 200) score -= 10;
    if (device.status !== 'online') score -= 40;

    score = Math.max(0, Math.min(100, score));
    setHealthScore(score);

    if (score >= 80) setHealth('healthy');
    else if (score >= 50) setHealth('warning');
    else setHealth('critical');
  }, [device]);

  return { health, healthScore };
}
