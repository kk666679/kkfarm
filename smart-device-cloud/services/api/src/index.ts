import Fastify, { type FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import jwt from '@fastify/jwt';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { registerTRPCPlugin } from './trpc/plugin.ts';
import { initDatabase, runMigrations, seedTestData } from './db/database.ts';
import { DeviceManager, setRealtimeService } from './server/device-manager.ts';
import { TaskQueue } from './workers/task-queue.ts';
import { createTaskHandlers } from './workers/task-handlers.ts';
import { deviceRoutes } from './server/devices.ts';
import { taskRoutes } from './server/tasks.ts';
import { jobRoutes } from './server/jobs.ts';
import { authRoutes } from './server/auth.ts';
import { metricsRoutes } from './server/metrics.ts';
import { aiRoutes } from './server/ai.ts';
import { deviceProfileRoutes } from './server/device-profiles.ts';
import { deviceGroupRoutes } from './server/device-groups.ts';
import { provisioningRoutes } from './server/provisioning.ts';
import { alertRoutes } from './server/alerts.ts';
import { analyticsRoutes } from './server/analytics.ts';
import { auditRoutes } from './server/audit.ts';
import { costRoutes } from './server/cost.ts';
import { intelligenceRoutes } from './server/intelligence.ts';
import { securityRoutes } from './server/security.ts';
import { adminRoutes } from './server/admin.ts';
import { workflowRoutes } from './server/workflows.ts';
import { workloadRoutes } from './server/workloads.ts';
import { applicationRoutes } from './server/applications.ts';
import { WebSocketService } from './websocket/websocket-service.ts';
import { LocalDeviceProvider } from './server/local-device-provider.ts';
import {
  registerPrometheusRoute,
  trackHttpMetrics,
  updateDeviceMetrics,
  updateTaskMetrics,
} from './metrics/prometheus.ts';

export let wsService: WebSocketService;
export let globalDeviceManager: DeviceManager;

const buildApp = async () => {
  const app = Fastify({
    logger: { level: process.env.NODE_ENV === 'test' ? 'error' : 'info' },
    requestIdHeader: 'x-request-id',
    logController: new (
      Fastify as typeof Fastify & {
        LogController: new (options: {
          requestIdLogLabel: string;
          disableRequestLogging: boolean;
        }) => unknown;
      }
    ).LogController({
      requestIdLogLabel: 'reqId',
      disableRequestLogging: false,
    }),
  });

  if (process.env.NODE_ENV === 'test') {
    await initDatabase();
    runMigrations();
    seedTestData();
  }

  app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  });

  app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    ban: 3,
    cache: 10000,
    skipOnError: true,
    allowList: (req: FastifyRequest) => {
      return req.url === '/metrics';
    },
  });

  app.register(cors, {
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  });

  app.register(websocket);

  app.register(jwt, {
    secret: process.env.JWT_SECRET || 'test-secret',
  });

  // Register tRPC plugin for hybrid API pattern
  await registerTRPCPlugin(app, {
    prefix: '/trpc',
    environment: process.env.NODE_ENV as 'development' | 'production',
  });

  app.register(swagger, {
    openapi: {
      info: {
        title: 'Device Farm API',
        description: 'Self-hosted Android device farm REST API',
        version: '0.1.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'devices', description: 'Device management endpoints' },
        { name: 'tasks', description: 'Task management endpoints' },
        { name: 'jobs', description: 'Scheduled job endpoints' },
        { name: 'auth', description: 'Authentication endpoints' },
        { name: 'metrics', description: 'Metrics and monitoring endpoints' },
        { name: 'health', description: 'Health check endpoints' },
        { name: 'monitoring', description: 'Prometheus monitoring' },
        { name: 'ai', description: 'AI streaming endpoints' },
        { name: 'device-profiles', description: 'Device profile management endpoints' },
        { name: 'device-groups', description: 'Device group management endpoints' },
        { name: 'provisioning', description: 'Provisioning endpoints' },
      ],
    },
  });

  app.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: header => header,
  });

  trackHttpMetrics(app);
  registerPrometheusRoute(app);

  app.get(
    '/api/health',
    {
      schema: {
        description: 'Health check endpoint',
        tags: ['health'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              uptime: { type: 'number' },
            },
          },
        },
      },
    },
    async () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  );

  app.get(
    '/api/v1/health',
    {
      schema: {
        description: 'Health check endpoint (v1)',
        tags: ['health'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              uptime: { type: 'number' },
            },
          },
        },
      },
    },
    async () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  );

  app.get(
    '/api/ready',
    {
      schema: {
        description: 'Readiness probe for Kubernetes/Docker',
        tags: ['health'],
        response: {
          200: {
            type: 'object',
            properties: {
              ready: { type: 'boolean' },
            },
          },
        },
      },
    },
    async () => ({ ready: true })
  );

  app.get(
    '/api/v1/ready',
    {
      schema: {
        description: 'Readiness probe for Kubernetes/Docker (v1)',
        tags: ['health'],
        response: {
          200: {
            type: 'object',
            properties: {
              ready: { type: 'boolean' },
            },
          },
        },
      },
    },
    async () => ({ ready: true })
  );

  app.get(
    '/api/health/info',
    {
      schema: {
        description: 'Runtime info — version and environment',
        tags: ['health'],
        response: {
          200: {
            type: 'object',
            properties: {
              version: { type: 'string' },
              environment: { type: 'string' },
            },
          },
        },
      },
    },
    async () => ({
      version: '0.1.0',
      environment: process.env.NODE_ENV ?? 'development',
    })
  );

  app.get(
    '/api/v1/health/info',
    {
      schema: {
        description: 'Runtime info — version and environment (v1)',
        tags: ['health'],
        response: {
          200: {
            type: 'object',
            properties: {
              version: { type: 'string' },
              environment: { type: 'string' },
            },
          },
        },
      },
    },
    async () => ({
      version: '0.1.0',
      environment: process.env.NODE_ENV ?? 'development',
    })
  );

  const provider = new LocalDeviceProvider();
  const deviceManager = new DeviceManager(provider);
  globalDeviceManager = deviceManager;
  (app as any).deviceManager = deviceManager;

  const taskQueue = new TaskQueue({
    deviceManager,
    provider,
    concurrency: Number(process.env.TASK_CONCURRENCY ?? 5),
    logger: app.log,
  });

  wsService = new WebSocketService(app);
  wsService.register();
  setRealtimeService(wsService);

  app.register(deviceRoutes, { prefix: '/api/v1', deviceManager } as any);
  app.register(taskRoutes, { prefix: '/api/v1', taskQueue } as any);
  app.register(jobRoutes, { prefix: '/api/v1' });
  app.register(authRoutes, { prefix: '/api/v1' });
  app.register(metricsRoutes, { prefix: '/api/v1' });
  app.register(aiRoutes, { prefix: '/api/v1' });
  app.register(deviceProfileRoutes, { prefix: '/api/v1' });
  app.register(deviceGroupRoutes, { prefix: '/api/v1' });
  app.register(provisioningRoutes, { prefix: '/api/v1' });
  app.register(alertRoutes, { prefix: '/api/v1' });
  app.register(analyticsRoutes, { prefix: '/api/v1' });
  app.register(auditRoutes, { prefix: '/api/v1' });
  app.register(costRoutes, { prefix: '/api/v1' });
  app.register(intelligenceRoutes, { prefix: '/api/v1' });
  app.register(securityRoutes, { prefix: '/api/v1' });
  app.register(adminRoutes, { prefix: '/api/v1' });
  app.register(workflowRoutes, { prefix: '/api/v1' });
  app.register(workloadRoutes, { prefix: '/api/v1' });
  app.register(applicationRoutes, { prefix: '/api/v1' });

  // Backward-compatible aliases under /api (deprecated, will be removed in v2)
  app.register(deviceRoutes, { prefix: '/api', deviceManager } as any);
  app.register(taskRoutes, { prefix: '/api', taskQueue } as any);
  app.register(jobRoutes, { prefix: '/api' });
  app.register(authRoutes, { prefix: '/api' });
  app.register(metricsRoutes, { prefix: '/api' });
  app.register(aiRoutes, { prefix: '/api' });
  app.register(deviceProfileRoutes, { prefix: '/api' });
  app.register(deviceGroupRoutes, { prefix: '/api' });
  app.register(provisioningRoutes, { prefix: '/api' });
  app.register(alertRoutes, { prefix: '/api' });
  app.register(analyticsRoutes, { prefix: '/api' });
  app.register(auditRoutes, { prefix: '/api' });
  app.register(costRoutes, { prefix: '/api' });
  app.register(intelligenceRoutes, { prefix: '/api' });
  app.register(securityRoutes, { prefix: '/api' });
  app.register(adminRoutes, { prefix: '/api' });
  app.register(workflowRoutes, { prefix: '/api' });
  app.register(workloadRoutes, { prefix: '/api' });
  app.register(applicationRoutes, { prefix: '/api' });

  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);

    const err = error instanceof Error ? error : new Error(String(error));

    if ((err as any).validation) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: (err as any).validation,
        },
      });
    }

    if ((err as any).statusCode === 429) {
      return reply.status(429).send({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later',
        },
      });
    }

    const statusCode = (err as any).statusCode || 500;
    return reply.status(statusCode).send({
      error: {
        code: (err as any).code || 'INTERNAL_ERROR',
        message: statusCode >= 500 ? 'Internal server error' : err.message,
      },
    });
  });

  app.addHook('onReady', async () => {
    app.log.info('API ready');
    void taskQueue.processNext();
    startMetricsCollection();
  });

  const closeGracefully = async (signal: string) => {
    app.log.info(`Received ${signal}, closing gracefully...`);
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => closeGracefully('SIGTERM'));
  process.on('SIGINT', () => closeGracefully('SIGINT'));

  return app;
};

function startMetricsCollection() {
  setInterval(async () => {
    try {
      if (globalDeviceManager) {
        const devices = globalDeviceManager.getAll();
        updateDeviceMetrics(devices);
      }

      const { all } = await import('./db/database.js');
      const tasks = all<{ status: string }>(
        'SELECT * FROM tasks WHERE created_at > datetime("now", "-1 hour")'
      );
      updateTaskMetrics(tasks);
    } catch (error) {
      console.error('Error collecting metrics:', error);
    }
  }, 15000);
}

process.on('uncaughtException', err => {
  console.error('Uncaught exception', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const start = async () => {
  const port = Number(process.env.API_PORT ?? 3000);
  const host = process.env.API_HOST ?? '0.0.0.0';
  await initDatabase();
  runMigrations();
  const app = await buildApp();
  try {
    await app.listen({ port, host });
    console.log(`API listening on http://${host}:${port}`);
    console.log(`API documentation available on http://${host}:${port}/documentation`);
    console.log(`Prometheus metrics available on http://${host}:${port}/metrics`);
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'EADDRINUSE') {
      console.error(
        `API port ${port} is already in use. Reuse the existing API or start this instance with API_PORT set to another port.`
      );
    }
    app.log.error(err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  start();
}

export { buildApp };
export { appRouter } from './trpc/router.ts';
export type { AppRouter } from './trpc/router.ts';
export type { Context } from './trpc/context.ts';
