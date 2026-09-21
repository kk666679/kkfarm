import { Copy, RefreshCw, ThumbsDown, ThumbsUp, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIActionBarProps {
  onCopy?: () => void;
  onRetry?: () => void;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  onViewSources?: () => void;
  className?: string;
  hidden?: boolean;
}

export function AIActionBar({
  onCopy,
  onRetry,
  onThumbsUp,
  onThumbsDown,
  onViewSources,
  className,
  hidden,
}: AIActionBarProps) {
  const items = [
    onCopy && { key: 'copy', label: 'Copy', icon: Copy, onClick: onCopy },
    onRetry && { key: 'retry', label: 'Retry', icon: RefreshCw, onClick: onRetry },
    onViewSources && { key: 'sources', label: 'Sources', icon: Link2, onClick: onViewSources },
    onThumbsUp && { key: 'up', label: 'Good response', icon: ThumbsUp, onClick: onThumbsUp },
    onThumbsDown && { key: 'down', label: 'Bad response', icon: ThumbsDown, onClick: onThumbsDown },
  ].filter(Boolean) as Array<{ key: string; label: string; icon: typeof Copy; onClick: () => void }>;

  if (hidden || items.length === 0) return null;

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {items.map(item => {
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            type="button"
            onClick={item.onClick}
            aria-label={item.label}
            title={item.label}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
