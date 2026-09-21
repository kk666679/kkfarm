import { useState } from 'react';
import { Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

interface LoginFormProps {
  onSubmit?: (credentials: { email: string; password: string }) => void;
  error?: string | null;
}

export function LoginForm({ onSubmit, error }: LoginFormProps) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(error ?? null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const tokenEndpoint = import.meta.env.VITE_AUTH_TOKEN_URL || '/auth/token';
      const res = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, grant_type: 'password' }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body?.error_description ?? body?.error?.message ?? `Authentication failed (${res.status})`
        );
      }

      const data = await res.json();
      const token = data.access_token ?? data.token;
      if (!token) {
        throw new Error('No access token returned from auth server');
      }

      const user = data.user ?? {
        id: data.sub ?? 'unknown',
        email,
        name: data.name ?? email,
        role: data.role ?? 'viewer',
      };

      login(token, user);
      onSubmit?.({ email, password });
    } catch (err) {
      setLocalError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md space-y-6 p-8 bg-slate-900 rounded-xl border border-slate-800">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg mb-4">
            S
          </div>
          <h1 className="text-2xl font-bold">Smart Device Cloud</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your dashboard</p>
        </div>

        {localError && (
          <div className="p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                name="email"
                type="email"
                required
                disabled={loading}
                placeholder="admin@company.com"
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                name="password"
                type="password"
                required
                disabled={loading}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
