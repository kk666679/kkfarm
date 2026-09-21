export type RemotePermission = 'screen' | 'input' | 'install' | 'record' | 'files';
export type RemoteSessionState = 'starting' | 'active' | 'idle' | 'paused' | 'closed' | 'error';
export type ConnectivityState = 'online' | 'degraded' | 'offline';
export type StreamQuality = 'low' | 'medium' | 'high' | 'adaptive';

export interface RemoteSession {
  id: string;
  deviceId: string;
  userId: string;
  permissions: RemotePermission[];
  createdAt: string;
  lastActive: string;
  active: boolean;
  state: RemoteSessionState;
  connectivity: ConnectivityState;
  quality: StreamQuality;
}

export interface RemoteSessionInput {
  deviceId: string;
  userId: string;
  permissions: RemotePermission[];
  quality?: StreamQuality;
}

export interface ScreenFrame {
  sequence: number;
  width: number;
  height: number;
  mimeType: 'image/jpeg' | 'image/png';
  data: string;
  capturedAt: string;
}

export interface FileTransfer {
  id: string;
  sessionId: string;
  direction: 'upload' | 'download';
  path: string;
  sizeBytes: number;
  status: 'pending' | 'transferring' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export interface RemoteApplication {
  packageName: string;
  version: string;
  installed: boolean;
  running: boolean;
}

export interface Recording {
  id: string;
  sessionId: string;
  status: 'recording' | 'stopped' | 'failed';
  startedAt: string;
  stoppedAt?: string;
  path?: string;
}

export interface AuditEvent {
  id: string;
  sessionId: string;
  userId: string;
  action: string;
  resource?: string;
  timestamp: string;
  outcome: 'success' | 'failure';
  metadata?: Record<string, unknown>;
}

export interface RemotePhoneManager {
  createSession(input: RemoteSessionInput): RemoteSession;
  getSession(id: string): RemoteSession | undefined;
  listSessions(deviceId?: string): RemoteSession[];
  closeSession(id: string): void;
  grantPermission(id: string, permission: RemotePermission): RemoteSession | undefined;
  revokePermission(id: string, permission: RemotePermission): RemoteSession | undefined;
}
