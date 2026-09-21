import { cn } from '@/lib/utils';
import type { ContentItem } from '../types';

const STATUS_DOT: Record<ContentItem['status'], string> = {
  draft: 'bg-muted-foreground',
  'pending-approval': 'bg-amber-500',
  approved: 'bg-blue-500',
  scheduled: 'bg-primary',
  publishing: 'bg-primary animate-pulse',
  published: 'bg-emerald-500',
  failed: 'bg-destructive',
  archived: 'bg-muted-foreground',
};

interface ContentCalendarEventProps {
  item: ContentItem;
  onClick?: (item: ContentItem) => void;
  className?: string;
}

export function ContentCalendarEvent({
  item,
  onClick,
  className,
}: ContentCalendarEventProps) {
  const time = item.scheduledAt
    ? new Date(item.scheduledAt).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <button
      type="button"
      onClick={() => onClick?.(item)}
      title={item.title}
      className={cn(
        'flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-xs transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    >
      <span
        className={cn('h-1.5 w-1.5 shrink-0 rounded-full', STATUS_DOT[item.status])}
        aria-hidden="true"
      />
      {time && (
        <span className="shrink-0 tabular-nums text-muted-foreground">{time}</span>
      )}
      <span className="truncate text-foreground">{item.title}</span>
    </button>
  );
}
