import { Bell, User, LogOut, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch {
      // best-effort logout
    }
    logout();
    navigate('/');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'JD';

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-white">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium">
            {initials}
          </div>
          <div className="text-sm">
            <div className="font-medium">{user?.name ?? 'John Doe'}</div>
            <div className="text-xs text-slate-500">{user?.email ?? 'admin@acme.com'}</div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="p-2 text-slate-400 hover:text-white"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
