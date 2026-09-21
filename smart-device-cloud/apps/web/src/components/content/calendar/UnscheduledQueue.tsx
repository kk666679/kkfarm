import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContentTypeBadge } from '../badges/ContentTypeBadge';
import { ContentStatusBadge } from '../badges/ContentStatusBadge';
import type { ContentItem } from '../types';

interface UnscheduledQueueProps {
  items: ContentItem[];
  onSchedule: (item: ContentItem) => void;
  className?: string;
}

export function UnscheduledQueue({
  items,
  onSchedule,
  className,
}: UnscheduledQueueProps) {
  if (items.length === 0) {
    return (
      <div
        className={cn(
          'rounded-lg border border-dashed border-border bg-card/50 p-4 text-center text-sm text-muted-foreground',
          className
        )}
      >
        Everything is scheduled.
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border border-border bg-card', className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Unscheduled</h3>
        <span className="text-xs text-muted-foreground">{items.length}</span>
      </div>
      <ul role="list" className="max-h-[400px] divide-y divide-border overflow-y-auto">
        {items.map(it => (
          <li key={it.id} className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="line-clamp-1 text-sm font-medium text-foreground">
                {it.title}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <ContentTypeBadge type={it.type} showIcon={false} />
                <ContentStatusBadge status={it.status} showIcon={false} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSchedule(it)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              Schedule
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
