import type { FastifyInstance } from 'fastify';
import type { WebSocketEvent } from './realtime.ts';

type MessageHandler = (message: WebSocketEvent) => void;

interface ConnectionWithChannels {
  socket: any;
  _channels?: Set<string>;
}

export class WebSocketService {
  private sockets: Set<ConnectionWithChannels> = new Set();
  private subscriptions: Map<string, Set<MessageHandler>> = new Map();

  constructor(private app: FastifyInstance) {}

  register(): void {
    this.app.get('/ws', { websocket: true } as any, connection => {
      this.sockets.add(connection as unknown as ConnectionWithChannels);
      (connection as unknown as ConnectionWithChannels).socket.on('message', (raw: string) => {
        try {
          const message = JSON.parse(raw as string);
          if (message?.type === 'subscribe' && message.channel) {
            const conn = connection as unknown as ConnectionWithChannels;
            conn._channels = conn._channels || new Set();
            conn._channels.add(message.channel);
          }
          if (message?.type === 'unsubscribe' && message.channel) {
            const conn = connection as unknown as ConnectionWithChannels;
            conn._channels = conn._channels || new Set();
            conn._channels.delete(message.channel);
          }
        } catch {
          // ignore malformed control messages
        }
      });
      (connection as unknown as ConnectionWithChannels).socket.on('close', () => {
        this.sockets.delete(connection as unknown as ConnectionWithChannels);
      });
    });
  }

  broadcast(event: WebSocketEvent): void {
    const payload = JSON.stringify(event);
    for (const socket of this.sockets) {
      try {
        socket.socket.send(payload);
      } catch {
        this.sockets.delete(socket);
      }
    }
  }

  subscribe(channel: string, handler: MessageHandler): () => void {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    this.subscriptions.get(channel)!.add(handler);
    return () => {
      const handlers = this.subscriptions.get(channel);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.subscriptions.delete(channel);
        }
      }
    };
  }
}
