import fp from 'fastify-plugin';
import { AppError } from '../errors/error-types.js';

export default fp(async app => {
  app.setErrorHandler((error, req, reply) => {
    if (error instanceof AppError) {
      req.log.warn({ err: error, code: error.code }, 'Application error');
      return reply.code(error.status).send({
        type: `https://api.sdc.dev/errors/${error.code}`,
        title: error.title,
        status: error.status,
        detail: error.message,
        instance: req.url,
        requestId: req.id,
        ...(error.metadata ?? {}),
      });
    }

    if (typeof error === 'object' && error !== null && 'validation' in error && error.validation) {
      const validationError = error as { message?: string; validation: unknown };
      return reply.code(400).send({
        type: 'https://api.sdc.dev/errors/validation',
        title: 'Validation Error',
        status: 400,
        detail: validationError.message ?? 'Request validation failed',
        errors: validationError.validation,
        requestId: req.id,
      });
    }

    req.log.error({ err: error }, 'Unhandled error');
    return reply.code(500).send({
      type: 'https://api.sdc.dev/errors/internal',
      title: 'Internal Server Error',
      status: 500,
      detail:
        process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : error instanceof Error
            ? error.message
            : 'Unexpected error',
      requestId: req.id,
    });
  });

  app.setNotFoundHandler((req, reply) => {
    reply.code(404).send({
      type: 'https://api.sdc.dev/errors/not-found',
      title: 'Not Found',
      status: 404,
      detail: `Route ${req.method} ${req.url} not found`,
      requestId: req.id,
    });
  });
});
