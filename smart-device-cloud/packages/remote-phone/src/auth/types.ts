export type RemoteAuthScope =
  'screen:read' | 'input:write' | 'files:read' | 'files:write' | 'app:install' | 'record:write';

export interface RemoteAuthContext {
  userId: string;
  scopes: RemoteAuthScope[];
  sessionId?: string;
  expiresAt?: string;
}
