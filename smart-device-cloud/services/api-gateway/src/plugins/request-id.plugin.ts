import fp from 'fastify-plugin';
import { randomUUID } from 'node:crypto';

export default fp(async app => {
  app.addHook('onRequest', async req => {
    if (!req.headers['x-request-id']) {
      req.headers['x-request-id'] = randomUUID();
    }
  });
});
