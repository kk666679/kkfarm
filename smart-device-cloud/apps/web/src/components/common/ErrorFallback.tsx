import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorFallbackProps {
  title?: string;
  description?: string;
  /** Raw error — shown in a <details> for debugging. */
  error?: Error | null;
  onRetry?: () => void;
  className?: string;
  /** Show the raw error message. Default true in dev, false in prod. */
  showDetails?: boolean;
}

export function ErrorFallback({
  title = 'Something went wrong',
  description = 'An unexpected error occurred while rendering this section.',
  error,
  onRetry,
  className,
  showDetails = import.meta.env?.DEV ?? false,
}: ErrorFallbackProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-12 text-center',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      )}

      {showDetails && error && (
        <details className="w-full max-w-lg text-left">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
            Technical details
          </summary>
          <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-muted p-3 text-xs text-foreground">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}
    </div>
  );
}
