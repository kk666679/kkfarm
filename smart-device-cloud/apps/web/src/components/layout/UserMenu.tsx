/**
 * UserMenu - User profile dropdown menu
 */

import { useState } from 'react';
import { ChevronDown, LogOut, Settings, User } from 'lucide-react';

interface UserMenuProps {
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  onSettings?: () => void;
}

export function UserMenu({
  userName = 'User',
  userEmail = 'user@example.com',
  onLogout,
  onSettings,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100"
      >
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
        <div className="hidden text-left md:block">
          <div className="text-sm font-medium text-gray-900">{userName}</div>
          <div className="text-xs text-gray-500">{userEmail}</div>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0" onClick={() => setOpen(false)} />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
            <a
              href="/settings/profile"
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
            >
              <User className="h-4 w-4" />
              Profile
            </a>
            <button
              onClick={() => {
                onSettings?.();
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <button
              onClick={() => {
                onLogout?.();
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
