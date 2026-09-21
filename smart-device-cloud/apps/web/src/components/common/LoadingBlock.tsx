import { cn } from '@/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingBlockProps {
  label?: string;
  className?: string;
  /** Minimum height of the block. Default 160. */
  minHeight?: number | string;
  /** If true, show a shimmer instead of a spinner. */
  variant?: 'spinner' | 'skeleton';
  /** Number of skeleton rows when variant="skeleton". */
  rows?: number;
}

export function LoadingBlock({
  label = 'Loading…',
  className,
  minHeight = 160,
  variant = 'spinner',
  rows = 3,
}: LoadingBlockProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex w-full flex-col items-center justify-center rounded-lg border border-border bg-card/50',
        className
      )}
      style={{ minHeight }}
    >
      {variant === 'spinner' ? (
        <>
          <LoadingSpinner size="lg" label={null} />
          <p className="mt-3 text-sm text-muted-foreground">{label}</p>
          <span className="sr-only">{label}</span>
        </>
      ) : (
        <div className="w-full space-y-3 p-6">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="h-4 animate-pulse rounded bg-muted"
              style={{ width: `${90 - i * 12}%` }}
            />
          ))}
          <span className="sr-only">{label}</span>
        </div>
      )}
    </div>
  );
}
