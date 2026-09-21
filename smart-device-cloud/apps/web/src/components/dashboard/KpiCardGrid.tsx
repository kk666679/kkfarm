import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface KpiCardGridProps {
  children: ReactNode;
  /** Max columns on lg+. Default 4. */
  columns?: 2 | 3 | 4;
  className?: string;
}

const COL_CLASS = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
} as const;

export function KpiCardGrid({
  children,
  columns = 4,
  className,
}: KpiCardGridProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-3', COL_CLASS[columns], className)}>
      {children}
    </div>
  );
}
