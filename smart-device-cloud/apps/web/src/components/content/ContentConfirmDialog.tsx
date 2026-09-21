import { useEffect, useState, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  className?: string;
}

export function ContentConfirmDialog({ open, onOpenChange, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'default', onConfirm, loading = false, className }: ContentConfirmDialogProps) {
  const [busy, setBusy] = useState(false);
  const disabled = busy || loading;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !disabled) onOpenChange(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, disabled, onOpenChange]);

  if (!open) return null;

  const handleConfirm = async () => {
    setBusy(true);
    try { await onConfirm(); onOpenChange(false); } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-labelledby="content-confirm-title">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !disabled && onOpenChange(false)} aria-hidden="true" />
      <div className={cn('relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-xl', className)}>
        <div className="flex gap-3 px-5 py-4">
          {variant === 'danger' && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10" aria-hidden="true">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 id="content-confirm-title" className="text-base font-semibold text-foreground">{title}</h2>
            {description && <div className="mt-1 text-sm text-muted-foreground">{description}</div>}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
          <button type="button" onClick={() => onOpenChange(false)} disabled={disabled} className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">{cancelLabel}</button>
          <button type="button" onClick={handleConfirm} disabled={disabled} className={cn('rounded-lg px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50', variant === 'danger' ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90')}>{busy ? 'Working…' : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
