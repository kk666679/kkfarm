import { buildGateway } from './bootstrap.js';
import { gatewayConfig } from './config.js';

const app = await buildGateway(gatewayConfig);

try {
  await app.listen({ port: gatewayConfig.port, host: gatewayConfig.host });
  app.log.info(`Gateway listening on ${gatewayConfig.host}:${gatewayConfig.port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

const shutdown = async (signal: string) => {
  app.log.info(`Received ${signal}, shutting down gracefully`);
  try {
    await app.close();
    process.exit(0);
  } catch (error) {
    app.log.error({ error }, 'Shutdown error');
    process.exit(1);
  }
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('uncaughtException', err => {
  app.log.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});
process.on('unhandledRejection', reason => {
  app.log.fatal({ reason }, 'Unhandled rejection');
  process.exit(1);
});
