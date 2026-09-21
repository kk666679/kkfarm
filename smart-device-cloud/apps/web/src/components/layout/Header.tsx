import { Bell, Search, Command } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserMenu } from './UserMenu';
import { CommandPalette } from './CommandPalette';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onLogout?: () => void;
}

const SEARCH_DEBOUNCE_MS = 250;
const MIN_SEARCH_LENGTH = 3;

export function Header({ onLogout }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [commandOpen, setCommandOpen] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < MIN_SEARCH_LENGTH) return;
    const t = window.setTimeout(() => {
      navigate(`/devices?search=${encodeURIComponent(searchQuery.trim())}`, {
        replace: true,
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [searchQuery, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q.length >= MIN_SEARCH_LENGTH) {
      navigate(`/devices?search=${encodeURIComponent(q)}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 md:px-8">
          <form
            role="search"
            onSubmit={handleSubmit}
            className="relative max-w-md flex-1"
          >
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="search"
              placeholder="Search or ask anything..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search or ask anything"
              aria-describedby="search-hint"
              className={cn(
                'w-full rounded-lg border border-input bg-background py-2 pl-10 pr-10 text-sm',
                'placeholder:text-muted-foreground',
                'focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring'
              )}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                ×
              </button>
            )}
            <span id="search-hint" className="sr-only">
              Press Enter to search devices. Minimum {MIN_SEARCH_LENGTH} characters.
            </span>
          </form>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className={cn(
                'flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm',
                'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              )}
              aria-label="Open command palette"
              aria-haspopup="dialog"
              aria-expanded={commandOpen}
            >
              <Command className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Cmd+K</span>
            </button>
            <button
              type="button"
              className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              <span
                className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive"
                aria-hidden="true"
              />
            </button>
            <UserMenu onLogout={onLogout} />
          </div>
        </div>
      </header>
      {commandOpen && <CommandPalette />}
    </>
  );
}