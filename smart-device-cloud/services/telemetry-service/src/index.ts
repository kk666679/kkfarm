import net from 'net';
import pino from 'pino';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const logger = pino(
  process.env.NODE_ENV === 'production' ? undefined : { transport: { target: 'pino-pretty' } }
);

const TCP_HOST = process.env.TELEMETRY_SERVICE_HOST || '0.0.0.0';
const TCP_PORT = parseInt(process.env.TELEMETRY_SERVICE_PORT || '5000', 10);

// In-memory telemetry buffer (1000 samples per device)
const telemetryBuffer = new Map<string, any[]>();
const MAX_BUFFER_SIZE = 1000;

// TCP Server for device heartbeats
const tcpServer = net.createServer(socket => {
  const clientId = uuidv4();
  logger.info({ clientId }, 'Device connected');

  socket.on('data', data => {
    try {
      const message = JSON.parse(data.toString());

      if (message.type === 'heartbeat') {
        const deviceId = message.device_id;

        // Store in buffer
        if (!telemetryBuffer.has(deviceId)) {
          telemetryBuffer.set(deviceId, []);
        }

        const buffer = telemetryBuffer.get(deviceId)!;
        buffer.push({
          timestamp: message.timestamp,
          metrics: message.metrics,
          receivedAt: Date.now(),
        });

        // Keep only last 1000 samples
        if (buffer.length > MAX_BUFFER_SIZE) {
          buffer.shift();
        }

        logger.debug({ deviceId, metrics: message.metrics }, 'Telemetry received');
      }
    } catch (error) {
      logger.error({ error }, 'Failed to parse heartbeat');
    }
  });

  socket.on('end', () => {
    logger.info({ clientId }, 'Device disconnected');
  });

  socket.on('error', error => {
    logger.error({ clientId, error }, 'Socket error');
  });
});

tcpServer.listen(TCP_PORT, TCP_HOST, () => {
  logger.info(`Telemetry Service TCP server listening on ${TCP_HOST}:${TCP_PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  tcpServer.close(() => {
    logger.info('Telemetry Service shut down');
    process.exit(0);
  });
});

export { telemetryBuffer, tcpServer };
