import { useCallback, useEffect, useRef, useState } from 'react';

interface RealtimeEvent<T = unknown> {
  type: string;
  payload: T;
  timestamp: number;
}

interface UseRealtimeOptions<T> {
  channel: string;
  enabled?: boolean;
  onMessage?: (event: RealtimeEvent<T>) => void;
}

interface UseRealtimeReturn<T> {
  events: RealtimeEvent<T>[];
  send: (type: string, payload: T) => void;
  clear: () => void;
  connect: () => void;
  disconnect: () => void;
  isConnected: boolean;
}

export function useRealtime<T = unknown>(
  options: UseRealtimeOptions<T>
): UseRealtimeReturn<T> {
  const { channel, enabled = true, onMessage } = options;
  const [events, setEvents] = useState<RealtimeEvent<T>[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | number | null>(null);

  const connect = useCallback(() => {
    if (!enabled || !channel) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws/${channel}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = event => {
        try {
          const data: RealtimeEvent<T> = JSON.parse(event.data);
          setEvents(prev => [...prev.slice(-99), data]);
          onMessage?.(data);
        } catch {
          // ignore parse errors
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        reconnectTimeoutRef.current = setTimeout(() => connect(), 3000);
      };

      ws.onerror = () => {
        // connection errors trigger onclose
      };
    } catch {
      // ignore connection errors
    }
  }, [channel, enabled, onMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
  }, []);

  const send = useCallback((type: string, payload: T) => {
    wsRef.current?.send(JSON.stringify({ type, payload, timestamp: Date.now() }));
  }, []);

  const clear = useCallback(() => {
    setEvents([]);
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { events, send, clear, connect, disconnect, isConnected };
}