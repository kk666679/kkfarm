import { useEffect, useState, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  /**
   * Preferred for new code — receives the next open state.
   * At least one of `onOpenChange` / `onCancel` must be provided so the
   * dialog has a way to close.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Legacy close callback used by existing workflows pages. When provided,
   * it takes precedence over `onOpenChange(false)`.
   */
  onCancel?: () => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger' | 'destructive';
  onConfirm: () => void | Promise<void> | null | undefined;
  /** External loading state — disables both buttons. */
  loading?: boolean;
  className?: string;
}

/**
 * ConfirmDialog — lightweight confirm modal.
 *
 * No dependency on components/ui/*. Uses a native overlay pattern.
 * If a shadcn Dialog is later adopted, only this file changes.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  onCancel,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  loading = false,
  className,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);
  const isDanger = variant === 'danger' || variant === 'destructive';

  const close = () => {
    if (onCancel) onCancel();
    else onOpenChange?.(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  const disabled = busy || loading;

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm?.();
      close();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !disabled && close()}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-xl',
          className
        )}
      >
        <div className="flex gap-3 px-5 py-4">
          {isDanger && (
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10"
              aria-hidden="true"
            >
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 id="confirm-dialog-title" className="text-base font-semibold text-foreground">
              {title}
            </h2>
            {description && <div className="mt-1 text-sm text-muted-foreground">{description}</div>}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
          <button
            type="button"
            onClick={close}
            disabled={disabled}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={disabled}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
              isDanger ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'
            )}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
