export interface UserContext {
  id: string;
  role: string;
  tenantId: string;
  scopes: string[];
}

export interface RequestContext {
  requestId: string;
  user: UserContext | null;
  ip: string;
  userAgent: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
