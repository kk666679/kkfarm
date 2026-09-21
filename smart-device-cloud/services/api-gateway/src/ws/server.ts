import websocket from '@fastify/websocket';
import type { FastifyInstance } from 'fastify';

export async function registerWebSocket(
  app: FastifyInstance,
  opts: { prefix: string }
): Promise<void> {
  await app.register(websocket);

  app.get(`${opts.prefix}`, { websocket: true }, (socket, req) => {
    const connectionId = crypto.randomUUID();
    app.log.info({ connectionId }, 'WebSocket connected');

    socket.on('message', (raw: Buffer) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'subscribe') {
          for (const ch of msg.channels ?? []) app.log.info({ connectionId, ch }, 'Subscribe');
        }
      } catch {
        socket.send(JSON.stringify({ error: 'invalid_message' }));
      }
    });

    socket.on('close', () => {
      app.log.info({ connectionId }, 'WebSocket disconnected');
    });
  });
}
