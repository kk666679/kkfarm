import fp from 'fastify-plugin';

export default fp(async app => {
  app.addHook('onRequest', async req => {
    req.log.info(
      { requestId: req.id, method: req.method, url: req.url, ip: req.ip },
      'Request received'
    );
  });

  app.addHook('onResponse', async (req, reply) => {
    req.log.info(
      {
        requestId: req.id,
        method: req.method,
        url: req.url,
        statusCode: reply.statusCode,
        durationMs: reply.elapsedTime,
      },
      'Request completed'
    );
  });
});
