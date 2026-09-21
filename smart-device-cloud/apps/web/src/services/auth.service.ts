import { buildApiUrl } from '@/lib/api';

export interface AuthUser {
  id: string;
  username: string;
  avatar?: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const res = await fetch(buildApiUrl('/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
    }

    return res.json();
  },

  async register(input: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    company?: string;
  }): Promise<{ user: AuthUser }> {
    const res = await fetch(buildApiUrl('/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        firstName: input.firstName,
        lastName: input.lastName,
        company: input.company,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
    }

    return res.json();
  },

  async me(): Promise<{ user: AuthUser }> {
    const res = await fetch(buildApiUrl('/auth/me'), {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
    }
    return res.json();
  },

  async logout(): Promise<void> {
    await fetch(buildApiUrl('/auth/logout'), { method: 'POST' });
  },
};
