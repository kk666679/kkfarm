import fp from 'fastify-plugin';
import { trace, SpanStatusCode, context } from '@opentelemetry/api';
import type { FastifyPluginAsync } from 'fastify';

const tracer = trace.getTracer('sdc-api-gateway');

const plugin: FastifyPluginAsync = async app => {
  app.addHook('onRequest', async req => {
    const span = tracer.startSpan(`${req.method} ${req.url}`, {
      attributes: {
        'http.method': req.method,
        'http.url': req.url,
        'request.id': req.id,
      },
    });
    (req as any).span = span;
    (req as any).otelContext = trace.setSpan(context.active(), span);
  });

  app.addHook('preHandler', async req => {
    const span = (req as any).span;
    if (span && (req as any).user) {
      span.setAttribute('user.id', (req as any).user.id);
      span.setAttribute('user.role', (req as any).user.role);
      span.setAttribute('tenant.id', (req as any).user.tenantId);
    }
  });

  app.addHook('onResponse', async (req, reply) => {
    const span = (req as any).span;
    if (span) {
      span.setAttribute('http.status_code', reply.statusCode);
      span.setStatus({
        code: reply.statusCode < 400 ? SpanStatusCode.OK : SpanStatusCode.ERROR,
      });
      span.end();
    }
  });

  app.addHook('onError', async (req, _reply, error) => {
    const span = (req as any).span;
    if (span) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    }
  });
};

export default fp(plugin, { name: 'tracing-plugin' });
