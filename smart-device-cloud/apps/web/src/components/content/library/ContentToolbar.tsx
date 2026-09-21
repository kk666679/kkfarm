import { Search, LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContentSort, ContentSortKey, ContentViewMode } from '../types';

const SORT_OPTIONS: { value: ContentSortKey; label: string }[] = [
  { value: 'updatedAt', label: 'Last updated' },
  { value: 'createdAt', label: 'Created' },
  { value: 'scheduledAt', label: 'Scheduled' },
  { value: 'title', label: 'Title' },
];

interface ContentToolbarProps {
  query: string;
  onQueryChange: (v: string) => void;
  view: ContentViewMode;
  onViewChange: (v: ContentViewMode) => void;
  sort: ContentSort;
  onSortChange: (v: ContentSort) => void;
  onOpenFilters: () => void;
  activeFilterCount?: number;
  onClearFilters?: () => void;
  className?: string;
}

export function ContentToolbar({
  query,
  onQueryChange,
  view,
  onViewChange,
  sort,
  onSortChange,
  onOpenFilters,
  activeFilterCount = 0,
  onClearFilters,
  className,
}: ContentToolbarProps) {
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
          placeholder="Search content..."
          aria-label="Search content"
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

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onOpenFilters}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filters
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}

        <select
          value={sort.key}
          onChange={e => onSortChange({ ...sort, key: e.target.value as ContentSortKey })}
          aria-label="Sort"
          className="h-9 rounded-md border border-input bg-background px-2 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <div
          role="group"
          aria-label="View mode"
          className="flex items-center rounded-lg border border-border"
        >
          <button
            type="button"
            onClick={() => onViewChange('grid')}
            aria-pressed={view === 'grid'}
            aria-label="Grid view"
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-l-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              view === 'grid'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange('table')}
            aria-pressed={view === 'table'}
            aria-label="Table view"
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-r-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              view === 'table'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <List className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
