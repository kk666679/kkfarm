import { AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorDisplayProps {
  error?: Error | string;
  onRetry?: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  const message =
    typeof error === 'string' ? error : (error?.message ?? 'An unexpected error occurred');

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <AlertTriangle className="h-10 w-10 text-red-400" />
      <div className="text-center">
        <h3 className="font-medium text-red-400">Error</h3>
        <p className="text-sm text-slate-400">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  );
}

export default ErrorDisplay;
