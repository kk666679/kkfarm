import { useEffect, useState } from 'react';
import type { ContentItem } from '../types';

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface ContentScheduleDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  item?: ContentItem | null;
  onConfirm: (iso: string) => void;
}

export function ContentScheduleDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
}: ContentScheduleDialogProps) {
  const [value, setValue] = useState(() =>
    toLocalInputValue(new Date(Date.now() + 3600_000))
  );

  useEffect(() => {
    if (!open) return;
    setValue(
      toLocalInputValue(
        item?.scheduledAt
          ? new Date(item.scheduledAt)
          : new Date(Date.now() + 3600_000)
      )
    );
  }, [open, item?.id, item?.scheduledAt]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="content-schedule-title"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-xl">
        <h2
          id="content-schedule-title"
          className="text-base font-semibold text-foreground"
        >
          Schedule content
        </h2>
        {item && (
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a publish time for &ldquo;{item.title}&rdquo;.
          </p>
        )}
        <div className="mt-4">
          <label
            htmlFor="content-schedule-at"
            className="text-sm font-medium text-foreground"
          >
            Publish at
          </label>
          <input
            id="content-schedule-at"
            type="datetime-local"
            value={value}
            onChange={e => setValue(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(new Date(value).toISOString());
              onOpenChange(false);
            }}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
