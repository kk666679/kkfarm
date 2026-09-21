import type { RemoteApplication, RemoteSession } from '../types';

export class RemoteAppDeployment {
  async deploy(session: RemoteSession, application: RemoteApplication): Promise<RemoteApplication> {
    if (!session.permissions.includes('install')) throw new Error('Install permission denied');
    await Promise.resolve();
    return { ...application, installed: true, running: false };
  }
}
