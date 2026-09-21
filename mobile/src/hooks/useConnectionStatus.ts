import { useEffect, useState } from 'react';
import { ConnectionStatus } from '@/types';

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Simulate connection status monitoring
    const interval = setInterval(() => {
      const online = Math.random() > 0.3;
      setIsOnline(online);
      setStatus(online ? 'connected' : 'disconnected');
    }, 5000);

    // Initial check
    const initialOnline = Math.random() > 0.3;
    setIsOnline(initialOnline);
    setStatus(initialOnline ? 'connected' : 'disconnected');

    return () => clearInterval(interval);
  }, []);

  return { status, isOnline };
}
