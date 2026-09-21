import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIErrorFallbackProps {
  message?: string;
  detail?: string;
  onRetry?: () => void;
  className?: string;
}

export function AIErrorFallback({
  message = 'The assistant could not complete that request.',
  detail,
  onRetry,
  className,
}: AIErrorFallbackProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm',
        className
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="font-medium text-foreground">{message}</div>
        {detail && (
          <div className="mt-0.5 font-mono text-xs text-muted-foreground">{detail}</div>
        )}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RefreshCw className="h-3 w-3" aria-hidden="true" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
