import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface KeyValueItem {
  key: string;
  label: ReactNode;
  value: ReactNode;
  /** Render value in a monospace font. */
  mono?: boolean;
  /** Hide the item when value is null/undefined. */
  hideIfEmpty?: boolean;
}

interface KeyValueListProps {
  items: KeyValueItem[];
  /** Two-column vs single-column stacked. Default: two columns on sm+. */
  layout?: 'stacked' | 'inline';
  className?: string;
}

export function KeyValueList({
  items,
  layout = 'stacked',
  className,
}: KeyValueListProps) {
  const visible = items.filter(
    it => !(it.hideIfEmpty && (it.value === null || it.value === undefined || it.value === ''))
  );

  if (visible.length === 0) return null;

  if (layout === 'inline') {
    return (
      <dl className={cn('flex flex-wrap gap-x-6 gap-y-2', className)}>
        {visible.map(it => (
          <div key={it.key} className="flex items-baseline gap-2">
            <dt className="text-xs text-muted-foreground">{it.label}</dt>
            <dd className={cn('text-sm text-foreground', it.mono && 'font-mono text-xs')}>
              {it.value}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl className={cn('grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2', className)}>
      {visible.map(it => (
        <div key={it.key} className="min-w-0">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {it.label}
          </dt>
          <dd className={cn('mt-0.5 truncate text-sm text-foreground', it.mono && 'font-mono text-xs')}>
            {it.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
