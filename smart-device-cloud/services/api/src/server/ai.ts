import { FastifyPluginAsync } from 'fastify';
import { Readable } from 'node:stream';
import { AIService } from '../services/ai-service.ts';
import { AIChatBodySchema } from '../schemas/index.ts';
import { requirePermission, PERMISSIONS } from '../middleware/auth.middleware.ts';

export const aiRoutes: FastifyPluginAsync = async fastify => {
  fastify.post(
    '/ai/chat',
    {
      schema: {
        description: 'Stream AI chat completions for device farm operations',
        tags: ['ai'],
        body: AIChatBodySchema,
        response: {
          200: {
            type: 'string',
            description: 'Streamed text response',
          },
        },
      },
      preHandler: [requirePermission(PERMISSIONS.READ_ANALYTICS)],
    },
    async (request, reply) => {
      const body = request.body as { message: string };
      const stream = AIService.streamChat({ message: body.message });

      reply.raw.setHeader('content-type', 'text/plain; charset=utf-8');
      reply.raw.setHeader('cache-control', 'no-cache');
      reply.raw.setHeader('connection', 'keep-alive');

      try {
        for await (const chunk of stream) {
          if (reply.raw.writable) {
            reply.raw.write(chunk.delta);
            if (chunk.done && chunk.metadata) {
              reply.raw.write(`\n[EVENT:${JSON.stringify(chunk.metadata)}]`);
            }
          }
        }
      } finally {
        reply.raw.end();
      }

      return reply.raw;
    }
  );

  fastify.post(
    '/ai/chat/sync',
    {
      schema: {
        description: 'Non-streaming AI chat completion',
        tags: ['ai'],
        body: AIChatBodySchema,
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              message: { type: 'string' },
              context: { type: 'object' },
            },
          },
        },
      },
      preHandler: [requirePermission(PERMISSIONS.READ_ANALYTICS)],
    },
    async request => {
      const body = request.body as { message: string };
      return AIService.chat({ message: body.message });
    }
  );
};
