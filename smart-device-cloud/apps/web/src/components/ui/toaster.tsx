import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Toast {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive';
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (data: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((data: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev, { ...data, id }]);
    return id;
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>{children}</ToastContext.Provider>
  );
}

export function Toaster() {
  const { toasts, dismiss } = React.useContext(ToastContext)!;

  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:top-auto sm:bottom-0 sm:right-0 sm:top-auto'
      )}
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={cn(
            'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border bg-background p-6 pr-8 shadow-lg',
            toast.variant === 'destructive' &&
              'border-destructive bg-destructive text-destructive-foreground'
          )}
        >
          <div className="grid gap-1">
            {toast.title && <div className="text-sm font-semibold">{toast.title}</div>}
            {toast.description && <div className="text-sm opacity-90">{toast.description}</div>}
            {toast.action}
          </div>
          <button
            className={cn(
              'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100'
            )}
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss toast"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
