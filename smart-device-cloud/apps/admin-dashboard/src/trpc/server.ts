import { appRouter } from './router';
import { createHTTPServer } from '@trpc/server/adapters/standalone';

export const trpcServer = appRouter;

export const createTRPCServer = () => {
  return createHTTPServer({
    router: appRouter,
    createContext: () => ({}),
  });
};
