import { Platform, AppState, AppStateStatus } from 'react-native';
import type { ConnectionStatus } from '@/types';
import type { IWebSocketService, WebSocketMessage } from '@/types/services';
import { authService } from './AuthService';

type MessageHandler = (message: WebSocketMessage) => void;

declare global {
  namespace NodeJS {
    interface Timeout {}
  }
}

const WS_BASE_URL = Platform.select({
  ios: 'ws://localhost:3000',
  android: 'ws://10.0.2.2:3000',
  default: 'ws://localhost:3000',
});

class WebSocketService implements IWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = Infinity;
  private reconnectDelay: number = 1000;
  private maxReconnectDelay: number = 30000;
  private heartbeatInterval: number | null = null;
  private heartbeatTimeout: number | null = null;
  private messageBuffer: WebSocketMessage[] = [];
  private maxBufferSize: number = 100;
  private subscriptions: Map<string, Set<MessageHandler>> = new Map();
  private connectionStatus: ConnectionStatus = 'disconnected';
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();
  private appState: AppStateStatus = 'active';
  private url: string;

  constructor(baseUrl: string = WS_BASE_URL) {
    this.url = baseUrl;
    this.setupAppStateListener();
  }

  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    const token = await authService.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    this.setConnectionStatus('connecting');

    try {
      this.ws = new WebSocket(`${this.url}/ws?token=${token}`);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this) as any;
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this) as any;
    } catch (error) {
      this.handleError(error);
    }
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.setConnectionStatus('disconnected');
  }

  manualReconnect(): void {
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
    this.connect();
  }

  private handleOpen(): void {
    console.log('[WebSocket] Connection established');
    this.setConnectionStatus('connected');
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;

    this.startHeartbeat();
    this.flushMessageBuffer();
    this.resubscribeChannels();
  }

  private handleMessage(event: { data: string }): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data as string);

      if (message.type === 'pong') {
        this.handleHeartbeatResponse();
        return;
      }

      this.routeMessage(message);
    } catch (error) {
      console.error('[WebSocket] Message parsing error:', error);
    }
  }

  private handleError(error: any): void {
    console.error('[WebSocket] Error:', error);
    this.setConnectionStatus('error');
  }

  private handleClose(event: { code: number; reason: string }): void {
    console.log('[WebSocket] Connection closed:', event.code, event.reason);
    this.stopHeartbeat();
    this.setConnectionStatus('disconnected');

    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;

    const exponentialDelay = Math.min(
      this.maxReconnectDelay,
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    );

    const jitter = Math.random() * 1000;
    const delayWithJitter = exponentialDelay + jitter;

    console.log(
      `[WebSocket] Reconnecting in ${Math.round(delayWithJitter)}ms (attempt ${
        this.reconnectAttempts
      })`
    );

    setTimeout(() => {
      this.connect();
    }, delayWithJitter);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 30000) as unknown as number;
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  private sendHeartbeat(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({ type: 'ping', timestamp: Date.now() });

      this.heartbeatTimeout = setTimeout(() => {
        console.warn('[WebSocket] Heartbeat timeout - connection unhealthy');
        this.setConnectionStatus('unhealthy');
        this.ws?.close(1000, 'Heartbeat timeout');
      }, 10000) as unknown as number;
    }
  }

  private handleHeartbeatResponse(): void {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }

    if (this.connectionStatus === 'unhealthy') {
      this.setConnectionStatus('connected');
    }
  }

  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.bufferMessage(message);
    }
  }

  private bufferMessage(message: WebSocketMessage): void {
    if (this.messageBuffer.length >= this.maxBufferSize) {
      this.messageBuffer.shift();
    }
    this.messageBuffer.push(message);
  }

  private flushMessageBuffer(): void {
    while (this.messageBuffer.length > 0) {
      const message = this.messageBuffer.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  subscribe(channel: string, handler: MessageHandler): () => void {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }

    this.subscriptions.get(channel)!.add(handler);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({ type: 'subscribe', channel });
    }

    return () => {
      const handlers = this.subscriptions.get(channel);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.subscriptions.delete(channel);
          this.send({ type: 'unsubscribe', channel });
        }
      }
    };
  }

  private routeMessage(message: WebSocketMessage): void {
    const handlers: MessageHandler[] = [];
    this.subscriptions.forEach(channelHandlers => {
      channelHandlers.forEach(handler => handlers.push(handler));
    });
    handlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('[WebSocket] Handler error:', error);
      }
    });
  }

  private resubscribeChannels(): void {
    this.subscriptions.forEach((_, channel) => {
      this.send({ type: 'subscribe', channel });
    });
  }

  private setupAppStateListener(): void {
    AppState.addEventListener('change', this.handleAppStateChange.bind(this));
  }

  private handleAppStateChange(nextAppState: AppStateStatus): void {
    if (this.appState === 'active' && nextAppState.match(/inactive|background/)) {
      setTimeout(() => {
        if (AppState.currentState !== 'active') {
          console.log('[WebSocket] Closing connection due to extended background time');
          this.disconnect();
        }
      }, 300000);
    }

    if (this.appState.match(/inactive|background/) && nextAppState === 'active') {
      setTimeout(() => {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
          console.log('[WebSocket] Reconnecting after returning to foreground');
          this.connect();
        }
      }, 2000);
    }

    this.appState = nextAppState;
  }

  private setConnectionStatus(status: ConnectionStatus): void {
    this.connectionStatus = status;
    this.statusListeners.forEach(listener => listener(status));
  }

  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  onConnectionStatusChange(listener: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }
}

export const wsService = new WebSocketService();
export default wsService;
