import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContentStatusBadge } from '../badges/ContentStatusBadge';
import { ContentTypeBadge } from '../badges/ContentTypeBadge';
import { PlatformBadge } from '../badges/PlatformBadge';
import type {
  ContentFilters,
  ContentPlatform,
  ContentStatus,
  ContentType,
} from '../types';

const STATUSES: ContentStatus[] = [
  'draft',
  'pending-approval',
  'approved',
  'scheduled',
  'publishing',
  'published',
  'failed',
  'archived',
];
const TYPES: ContentType[] = ['post', 'image', 'carousel', 'video', 'reel', 'story', 'article'];
const PLATFORMS: ContentPlatform[] = [
  'instagram',
  'tiktok',
  'youtube',
  'twitter',
  'facebook',
  'linkedin',
  'threads',
  'reddit',
];

function toggle<T>(arr: T[] | undefined, value: T): T[] {
  const s = new Set(arr ?? []);
  if (s.has(value)) s.delete(value);
  else s.add(value);
  return [...s];
}

interface ContentFilterPanelProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  filters: ContentFilters;
  onFiltersChange: (f: ContentFilters) => void;
}

export function ContentFilterPanel({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
}: ContentFilterPanelProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  const statuses = filters.status ?? [];
  const types = filters.type ?? [];
  const platforms = filters.platforms ?? [];

  const clearAll = () =>
    onFiltersChange({
      query: filters.query,
      scheduledFrom: filters.scheduledFrom,
      scheduledTo: filters.scheduledTo,
    });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Content filters"
      className="fixed inset-0 z-50"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 right-0 z-10 flex w-full flex-col border-l border-border bg-card shadow-xl sm:max-w-md">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-base font-semibold text-foreground">Filters</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close filters"
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
          <section>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </div>
            <ul role="list" className="space-y-2">
              {STATUSES.map(s => (
                <li key={s} className="flex items-center gap-3">
                  <input
                    id={`content-status-${s}`}
                    type="checkbox"
                    checked={statuses.includes(s)}
                    onChange={() =>
                      onFiltersChange({ ...filters, status: toggle(statuses, s) })
                    }
                    className="h-4 w-4 cursor-pointer rounded border-input accent-primary"
                  />
                  <label
                    htmlFor={`content-status-${s}`}
                    className="cursor-pointer"
                  >
                    <ContentStatusBadge status={s} />
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Type
            </div>
            <ul role="list" className="space-y-2">
              {TYPES.map(t => (
                <li key={t} className="flex items-center gap-3">
                  <input
                    id={`content-type-${t}`}
                    type="checkbox"
                    checked={types.includes(t)}
                    onChange={() =>
                      onFiltersChange({ ...filters, type: toggle(types, t) })
                    }
                    className="h-4 w-4 cursor-pointer rounded border-input accent-primary"
                  />
                  <label htmlFor={`content-type-${t}`} className="cursor-pointer">
                    <ContentTypeBadge type={t} />
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Platform
            </div>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => {
                const checked = platforms.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      onFiltersChange({
                        ...filters,
                        platforms: toggle(platforms, p),
                      })
                    }
                    aria-pressed={checked}
                    className={cn(
                      'rounded-md border p-1 transition',
                      checked
                        ? 'border-primary ring-2 ring-primary/40'
                        : 'border-border hover:border-muted-foreground'
                    )}
                  >
                    <PlatformBadge platform={p} />
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Scheduled range
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="content-sched-from"
                  className="text-xs text-muted-foreground"
                >
                  From
                </label>
                <input
                  id="content-sched-from"
                  type="date"
                  value={filters.scheduledFrom?.slice(0, 10) ?? ''}
                  onChange={e =>
                    onFiltersChange({
                      ...filters,
                      scheduledFrom: e.target.value || undefined,
                    })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label
                  htmlFor="content-sched-to"
                  className="text-xs text-muted-foreground"
                >
                  To
                </label>
                <input
                  id="content-sched-to"
                  type="date"
                  value={filters.scheduledTo?.slice(0, 10) ?? ''}
                  onChange={e =>
                    onFiltersChange({
                      ...filters,
                      scheduledTo: e.target.value || undefined,
                    })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-between border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={clearAll}
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
