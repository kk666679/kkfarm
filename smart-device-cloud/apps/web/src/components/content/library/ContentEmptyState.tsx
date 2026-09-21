import { FileText, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function ContentEmptyState({
  title = 'No content yet',
  description = 'Create your first post, reel, or story to get started.',
  actionLabel = 'Create content',
  onAction,
  className,
}: ContentEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 px-6 py-16 text-center',
        className
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <FileText className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
