import type { RemoteApplication, RemoteSession } from '../types';

export class RemoteAppController {
  private readonly apps = new Map<string, RemoteApplication>();

  install(session: RemoteSession, application: RemoteApplication): RemoteApplication {
    if (!session.permissions.includes('install')) throw new Error('Install permission denied');
    const installed = { ...application, installed: true, running: false };
    this.apps.set(application.packageName, installed);
    return { ...installed };
  }

  launch(session: RemoteSession, packageName: string): RemoteApplication {
    const application = this.apps.get(packageName);
    if (!application?.installed) throw new Error(`Application is not installed: ${packageName}`);
    const updated = { ...application, running: true };
    this.apps.set(packageName, updated);
    return { ...updated };
  }

  stop(packageName: string): RemoteApplication | undefined {
    const application = this.apps.get(packageName);
    if (!application) return undefined;
    const updated = { ...application, running: false };
    this.apps.set(packageName, updated);
    return { ...updated };
  }
}
