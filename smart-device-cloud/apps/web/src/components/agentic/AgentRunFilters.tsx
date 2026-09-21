import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentRunStatus } from './types';

const STATUSES: AgentRunStatus[] = [
  'running',
  'waiting-approval',
  'completed',
  'failed',
  'cancelled',
  'pending',
];

const LABEL: Record<AgentRunStatus, string> = {
  running: 'Running',
  'waiting-approval': 'Waiting approval',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
  pending: 'Pending',
};

interface AgentRunFiltersProps {
  query: string;
  onQueryChange: (v: string) => void;
  statuses: AgentRunStatus[];
  onStatusesChange: (s: AgentRunStatus[]) => void;
  className?: string;
}

export function AgentRunFilters({
  query,
  onQueryChange,
  statuses,
  onStatusesChange,
  className,
}: AgentRunFiltersProps) {
  const toggleStatus = (s: AgentRunStatus) => {
    const next = new Set(statuses);
    if (next.has(s)) next.delete(s);
    else next.add(s);
    onStatusesChange([...next]);
  };

  const clearAll = () => {
    onQueryChange('');
    onStatusesChange([]);
  };

  const hasFilters = query.length > 0 || statuses.length > 0;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="relative max-w-md flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="Search runs by agent, ID, or device..."
          aria-label="Search runs"
          className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-8 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {STATUSES.map(s => {
          const active = statuses.includes(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => toggleStatus(s)}
              aria-pressed={active}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
              )}
            >
              {LABEL[s]}
            </button>
          );
        })}
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="rounded-full px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
