export function getApiBase(
  baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
): string {
  const envBase =
    typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_API_URL ?? '')
      : '';
  const fromConfig = (baseUrl || envBase || '').trim();

  if (!fromConfig) {
    return '/api/v1';
  }

  const normalized = fromConfig.replace(/\/+$/, '');
  if (/\/api(?:\/v1)?$/i.test(normalized)) {
    return normalized.replace(/\/api(?:\/v1)?$/i, '/api/v1');
  }

  return `${normalized}/api/v1`;
}

export function buildApiUrl(path: string, baseUrl = ''): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBase(baseUrl)}${normalizedPath}`;
}

const API_BASE = getApiBase();

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = buildApiUrl(path);
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
    ...options,
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    let body: any = {};
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: text };
    }
    throw new Error(body?.error?.message ?? body?.message ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string; timestamp: string }>('/health'),

  auth: {
    me: () => request<{ user: { id: string; username: string } }>('/auth/me'),
    login: (credentials: { username: string; password: string }) =>
      request<{ token: string; user: { id: string; username: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
  },

  devices: {
    list: (filters: Record<string, unknown> = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, String(value));
      });
      const query = params.toString();
      return request<{ devices: any[] }>(`/devices${query ? `?${query}` : ''}`);
    },
    get: (id: string) => request<{ device: any }>(`/devices/${id}`),
    create: (data: any) =>
      request<{ device: any }>('/devices', { method: 'POST', body: JSON.stringify(data) }),
    remove: (id: string) => request<{ success: boolean }>(`/devices/${id}`, { method: 'DELETE' }),
    start: (id: string) => request<{ device: any }>(`/devices/${id}/start`, { method: 'POST' }),
    stop: (id: string) => request<{ device: any }>(`/devices/${id}/stop`, { method: 'POST' }),
    restart: (id: string) => request<{ device: any }>(`/devices/${id}/restart`, { method: 'POST' }),
    shell: (id: string, command: string) =>
      request<{ device: any; result: any }>(`/devices/${id}/shell`, {
        method: 'POST',
        body: JSON.stringify({ command }),
      }),
    screenshot: (id: string) =>
      fetch(`${API_BASE}/devices/${id}/screenshot`).then(res => {
        if (!res.ok) throw new Error('Failed to load screenshot');
        return res.blob();
      }),
    logs: (id: string, filter?: string, maxLines = 200) =>
      request<{ lines: string[] }>(
        `/devices/${id}/logs?${filter ? `filter=${encodeURIComponent(filter)}&` : ''}maxLines=${maxLines}`
      ),
    launchApp: (id: string, packageName: string) =>
      request<{ device: any }>(`/devices/${id}/apps/launch`, {
        method: 'POST',
        body: JSON.stringify({ packageName }),
      }),
    uninstallApp: (id: string, packageName: string) =>
      request<{ device: any }>(`/devices/${id}/apps/uninstall`, {
        method: 'POST',
        body: JSON.stringify({ packageName }),
      }),
    clearApp: (id: string, packageName: string) =>
      request<{ device: any }>(`/devices/${id}/apps/clear`, {
        method: 'POST',
        body: JSON.stringify({ packageName }),
      }),
    installApk: (id: string, apkPath: string) =>
      request<{ device: any }>(`/devices/${id}/apps/install`, {
        method: 'POST',
        body: JSON.stringify({ apkPath }),
      }),
  },

  deviceProfiles: {
    list: () => request<{ profiles: any[] }>('/device-profiles'),
    get: (id: string) => request<{ profile: any }>(`/device-profiles/${id}`),
    create: (data: any) =>
      request<{ profile: any }>('/device-profiles', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<{ profile: any }>(`/device-profiles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      request<{ success: boolean }>(`/device-profiles/${id}`, { method: 'DELETE' }),
    publish: (id: string) =>
      request<{ profile: any }>(`/device-profiles/${id}/publish`, { method: 'POST' }),
    duplicate: (id: string) =>
      request<{ profile: any }>(`/device-profiles/${id}/duplicate`, { method: 'POST' }),
    versions: (id: string) => request<{ versions: any[] }>(`/device-profiles/${id}/versions`),
    restore: (id: string, versionId: string) =>
      request<{ profile: any }>(`/device-profiles/${id}/versions/${versionId}/restore`, {
        method: 'POST',
      }),
    compare: (id: string, versionId: string) =>
      request<{ comparison: any }>(
        `/device-profiles/${id}/compare?versionId=${encodeURIComponent(versionId)}`
      ),
  },

  provisioning: {
    providers: () => request<{ providers: any[] }>('/device-providers'),
    accounts: () => request<{ accounts: any[] }>('/accounts'),
    applications: () => request<{ applications: any[] }>('/applications'),
    provision: (data: any) =>
      request<{ device: any }>('/provisioning', { method: 'POST', body: JSON.stringify(data) }),
  },

  deviceGroups: {
    list: () => request<{ groups: any[] }>('/device-groups'),
    stats: () => request<{ stats: any }>('/device-groups/stats'),
    create: (data: any) =>
      request<{ group: any }>('/device-groups', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<{ group: any }>(`/device-groups/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      request<{ success: boolean }>(`/device-groups/${id}`, { method: 'DELETE' }),
    move: (id: string, parentId?: string) =>
      request<{ group: any }>(`/device-groups/${id}/move`, {
        method: 'POST',
        body: JSON.stringify({ parentId }),
      }),
  },

  tasks: {
    list: () => request<{ tasks: any[] }>('/tasks'),
    get: (id: string) => request<{ task: any }>(`/tasks/${id}`),
    create: (data: any) =>
      request<{ task: any }>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    cancel: (id: string) =>
      request<{ success: boolean }>(`/tasks/${id}/cancel`, { method: 'POST' }),
    retry: (id: string) => request<{ task: any }>(`/tasks/${id}/retry`, { method: 'POST' }),
  },

  jobs: {
    list: () => request<{ jobs: any[] }>('/jobs'),
    create: (data: any) =>
      request<{ job: any }>('/jobs', { method: 'POST', body: JSON.stringify(data) }),
    remove: (id: string) => request<{ success: boolean }>(`/jobs/${id}`, { method: 'DELETE' }),
  },

  metrics: () => request<{ devices: any; tasks: any; generatedAt: string }>('/metrics'),
  events: (since?: string) =>
    request<{ events: any[] }>(`/events${since ? `?since=${encodeURIComponent(since)}` : ''}`),
};

export type Api = typeof api;
