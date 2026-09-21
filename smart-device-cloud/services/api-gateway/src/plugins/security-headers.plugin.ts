import fp from 'fastify-plugin';
import helmet from '@fastify/helmet';

export default fp(async app => {
  await app.register(helmet, {
    contentSecurityPolicy: false,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    crossOriginResourcePolicy: { policy: 'same-site' },
  });
});
