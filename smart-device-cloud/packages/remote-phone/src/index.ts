/**
 * Smart Device Cloud Remote Phone.
 *
 * Owns remote sessions, permissions, screen streaming, file transfers,
 * application management, recording, audit logging, and connectivity.
 */

import type { Device, Permission as SharedPermission } from '@smart-device-cloud/shared';

export type Permission = 'screen' | 'input' | 'install' | 'record' | 'files';

export interface RemoteSession {
  id: string;
  deviceId: string;
  userId: string;
  permissions: Permission[];
  createdAt: string;
  lastActive: string;
  active: boolean;
}

export interface RemotePhoneManager {
  createSession(input: {
    deviceId: string;
    userId: string;
    permissions: Permission[];
  }): RemoteSession;
  getSession(id: string): RemoteSession | undefined;
  listSessions(deviceId?: string): RemoteSession[];
  closeSession(id: string): void;
  grantPermission(id: string, permission: Permission): RemoteSession | undefined;
  revokePermission(id: string, permission: Permission): RemoteSession | undefined;
}

export class InMemoryRemotePhoneManager implements RemotePhoneManager {
  private readonly sessions = new Map<string, RemoteSession>();

  createSession(input: {
    deviceId: string;
    userId: string;
    permissions: Permission[];
  }): RemoteSession {
    const session: RemoteSession = {
      id: `remote-${Date.now()}`,
      deviceId: input.deviceId,
      userId: input.userId,
      permissions: input.permissions,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      active: true,
    };
    this.sessions.set(session.id, session);
    return session;
  }

  getSession(id: string): RemoteSession | undefined {
    return this.sessions.get(id);
  }

  listSessions(deviceId?: string): RemoteSession[] {
    const all = Array.from(this.sessions.values());
    return deviceId ? all.filter(s => s.deviceId === deviceId) : all;
  }

  closeSession(id: string): void {
    const session = this.sessions.get(id);
    if (session) {
      session.active = false;
    }
  }

  grantPermission(id: string, permission: Permission): RemoteSession | undefined {
    const session = this.sessions.get(id);
    if (session && !session.permissions.includes(permission)) {
      session.permissions.push(permission);
    }
    return session;
  }

  revokePermission(id: string, permission: Permission): RemoteSession | undefined {
    const session = this.sessions.get(id);
    if (session) {
      session.permissions = session.permissions.filter(p => p !== permission);
    }
    return session;
  }
}

export default {
  InMemoryRemotePhoneManager,
};

// Re-export shared types for convenience
export type { Device };
