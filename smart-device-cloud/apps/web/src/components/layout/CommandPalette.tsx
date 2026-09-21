/**
 * CommandPalette - Global command surface for intent-aware search
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, X, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { navigationConfig } from '@/components/layout/navigation';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  label: string;
  category: string;
  icon: string;
  shortcut?: string;
  href?: string;
  action?: () => void;
}

const allCommands: CommandItem[] = [
  { id: 'nav-dashboard', label: 'Dashboard', category: 'Navigation', icon: 'LayoutDashboard', href: '/dashboard' },
  { id: 'nav-devices', label: 'Devices', category: 'Navigation', icon: 'Smartphone', href: '/devices' },
  { id: 'nav-sessions', label: 'Sessions', category: 'Navigation', icon: 'Monitor', href: '/sessions' },
  { id: 'nav-tasks', label: 'Tasks', category: 'Navigation', icon: 'Zap', href: '/tasks' },
  { id: 'nav-queue', label: 'Queue', category: 'Navigation', icon: 'List', href: '/queue' },
  { id: 'nav-agents', label: 'Agents', category: 'Navigation', icon: 'Cpu', href: '/agents' },
  { id: 'nav-assistant', label: 'AI Assistant', category: 'Navigation', icon: 'Brain', href: '/assistant' },
  { id: 'nav-health', label: 'Health Center', category: 'Navigation', icon: 'Heart', href: '/health' },
  { id: 'nav-alerts', label: 'Alerts', category: 'Navigation', icon: 'Bell', href: '/alerts' },
  { id: 'nav-content', label: 'Content Library', category: 'Navigation', icon: 'PenTool', href: '/content' },
  { id: 'action-reboot', label: 'Restart selected devices', category: 'Actions', icon: 'RefreshCw' },
  { id: 'action-bulk', label: 'Bulk device operations', category: 'Actions', icon: 'Users' },
  { id: 'action-create-pool', label: 'Create device pool', category: 'Actions', icon: 'Layers' },
  { id: 'action-run-automation', label: 'Run automation', category: 'Actions', icon: 'Play' },
  { id: 'filter-online', label: 'Show online devices', category: 'Filters', icon: 'Wifi' },
  { id: 'filter-offline', label: 'Show offline devices', category: 'Filters', icon: 'WifiOff' },
  { id: 'filter-unhealthy', label: 'Show unhealthy devices', category: 'Filters', icon: 'AlertTriangle' },
  { id: 'filter-low-battery', label: 'Show low battery devices', category: 'Filters', icon: 'BatteryLow' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
        if (!open) setQuery('');
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allCommands;
    const q = query.toLowerCase();
    return allCommands.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    for (const cmd of filtered) {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    }
    return groups;
  }, [filtered]);

  const handleSelect = useCallback((cmd: CommandItem) => {
    if (cmd.href) {
      navigate(cmd.href);
    }
    if (cmd.action) {
      cmd.action();
    }
    setOpen(false);
    setQuery('');
  }, [navigate]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500 shadow-sm hover:bg-gray-50 transition-colors"
        aria-label="Open command palette"
        type="button"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="hidden md:inline">Search or ask anything...</span>
        <kbd className="hidden md:inline-flex items-center rounded border bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
          <Command className="h-3 w-3" /> K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16" role="dialog" aria-label="Command palette">
      <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden="true" />
      <div className="relative w-full max-w-2xl rounded-lg border border-gray-200 bg-white shadow-xl">
        <div className="flex items-center border-b border-gray-200 px-4 py-3">
          <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          <input
            autoFocus
            type="search"
            placeholder="Search or ask anything..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="ml-3 flex-1 outline-none text-sm"
            aria-label="Search commands"
          />
          <button
            onClick={() => setOpen(false)}
            className="rounded p-1 hover:bg-gray-100"
            aria-label="Close command palette"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2" role="listbox">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="py-2 px-2 text-xs font-semibold text-gray-500 uppercase">
                {category}
              </div>
              {items.map(cmd => (
                <Link
                  key={cmd.id}
                  to={cmd.href || '#'}
                  onClick={e => { if (!cmd.href) e.preventDefault(); handleSelect(cmd); }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  role="option"
                >
                  <span className="text-gray-400" aria-hidden="true">●</span>
                  <span>{cmd.label}</span>
                  {cmd.shortcut && (
                    <kbd className="ml-auto text-xs text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </Link>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-8 text-center text-gray-500 text-sm">No results found</div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
          <span>↑↓ to navigate • Enter to select • Esc to close</span>
          <span className="hidden sm:inline">{filtered.length} results</span>
        </div>
      </div>
    </div>
  );
}
