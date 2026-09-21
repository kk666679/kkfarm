import type { FastifyRequest, FastifyReply } from 'fastify';

const TLS_HEADER = 'x-forwarded-proto';
const CERTIFICATE_PINNING_HEADER = 'x-device-certificate';

export function securityMiddleware() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const isHttps =
      (request.raw as any).connection?.encrypted || request.headers[TLS_HEADER] === 'https';

    if (!isHttps && process.env.NODE_ENV === 'production') {
      return reply.status(403).send({
        error: { code: 'FORBIDDEN', message: 'TLS 1.3 is required in production' },
      });
    }

    reply.header('strict-transport-security', 'max-age=63072000; includeSubDomains; preload');
    reply.header('x-content-type-options', 'nosniff');
    reply.header('x-frame-options', 'DENY');
    reply.header('x-xss-protection', '1; mode=block');
    reply.header('referrer-policy', 'strict-origin-when-cross-origin');
    reply.header('permissions-policy', 'geolocation=(), microphone=(), camera=()');
    reply.header('cross-origin-embedder-policy', 'require-corp');
    reply.header('cross-origin-opener-policy', 'same-origin');
  };
}

export function enforceTLS() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const isHttps =
      (request.raw as any).connection?.encrypted || request.headers[TLS_HEADER] === 'https';

    if (!isHttps) {
      return reply.status(426).send({
        error: { code: 'UPGRADE_REQUIRED', message: 'TLS 1.3 is required for this endpoint' },
      });
    }
  };
}

export function validateCertificatePinning() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    const clientCert = request.headers[CERTIFICATE_PINNING_HEADER];
    if (!clientCert) {
      return reply.status(403).send({
        error: { code: 'FORBIDDEN', message: 'Client certificate is required' },
      });
    }

    const pinnedCert = process.env.PINNED_CERTIFICATE_SHA256;
    if (pinnedCert && clientCert !== pinnedCert) {
      return reply.status(403).send({
        error: { code: 'FORBIDDEN', message: 'Invalid client certificate' },
      });
    }
  };
}
