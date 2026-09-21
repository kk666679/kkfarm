import type { RemoteSession, RemotePermission } from '../types';

export class RemotePermissionEngine {
  grant(session: RemoteSession, permission: RemotePermission): RemoteSession {
    if (!session.active) throw new Error('Remote session is not active');
    if (!session.permissions.includes(permission)) session.permissions.push(permission);
    return {
      ...session,
      permissions: [...session.permissions],
      lastActive: new Date().toISOString(),
    };
  }

  revoke(session: RemoteSession, permission: RemotePermission): RemoteSession {
    return {
      ...session,
      permissions: session.permissions.filter(item => item !== permission),
      lastActive: new Date().toISOString(),
    };
  }

  require(session: RemoteSession, permission: RemotePermission): void {
    if (!session.active || !session.permissions.includes(permission))
      throw new Error(`Permission denied: ${permission}`);
  }
}

export class RemoteSessionRecovery {
  recover(session: RemoteSession): RemoteSession {
    if (session.state === 'closed' || session.state === 'error')
      throw new Error('Remote session cannot be recovered');
    return {
      ...session,
      state: 'active',
      active: true,
      connectivity: 'online',
      lastActive: new Date().toISOString(),
      permissions: [...session.permissions],
    };
  }
}
