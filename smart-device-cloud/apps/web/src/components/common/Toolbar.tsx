import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  /** Left side — search, filters, view toggles. */
  start?: ReactNode;
  /** Center — rarely used; aligned centrally when present. */
  center?: ReactNode;
  /** Right side — primary actions. */
  end?: ReactNode;
  className?: string;
  /** Remove border and padding for embedding inside cards. */
  bare?: boolean;
}

export function Toolbar({ start, center, end, className, bare = false }: ToolbarProps) {
  return (
    <div
      role="toolbar"
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center',
        !bare && 'border-b border-border pb-3',
        className
      )}
    >
      {start && <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{start}</div>}
      {center && <div className="flex items-center justify-center">{center}</div>}
      {end && <div className="flex shrink-0 flex-wrap items-center gap-2">{end}</div>}
    </div>
  );
}
