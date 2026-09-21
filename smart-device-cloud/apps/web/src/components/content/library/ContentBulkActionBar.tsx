import { Calendar, CheckCircle2, Copy, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentBulkActionBarProps {
  count: number;
  onClear: () => void;
  onApprove?: () => void;
  onSchedule?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function ContentBulkActionBar({
  count,
  onClear,
  onApprove,
  onSchedule,
  onDuplicate,
  onDelete,
  className,
}: ContentBulkActionBarProps) {
  if (count === 0) return null;

  const btn =
    'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className={cn(
        'sticky bottom-4 z-30 mx-auto flex w-fit items-center gap-1 rounded-full border border-border bg-card px-2 py-1.5 shadow-lg',
        className
      )}
    >
      <span className="px-3 text-sm font-medium text-foreground">
        {count} selected
      </span>
      {onApprove && (
        <button type="button" onClick={onApprove} className={btn}>
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Approve
        </button>
      )}
      {onSchedule && (
        <button type="button" onClick={onSchedule} className={btn}>
          <Calendar className="h-4 w-4" aria-hidden="true" />
          Schedule
        </button>
      )}
      {onDuplicate && (
        <button type="button" onClick={onDuplicate} className={btn}>
          <Copy className="h-4 w-4" aria-hidden="true" />
          Duplicate
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className={cn(btn, 'text-destructive hover:bg-destructive/10')}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Delete
        </button>
      )}
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear selection"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
