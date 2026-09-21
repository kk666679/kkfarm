/**
 * ErrorState - Error display component
 */

import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ title = 'Error', message, onRetry, className = '' }: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-red-300 bg-red-50 py-12 ${className}`}
    >
      <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
      <h3 className="text-lg font-medium text-red-900">{title}</h3>
      <p className="mt-2 text-center text-sm text-red-700 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try again
        </button>
      )}
    </div>
  );
}
