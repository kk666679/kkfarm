import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveStackProps {
  children: ReactNode;
  className?: string;
  direction?: 'row' | 'col' | 'responsive';
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  items?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'between' | 'around';
}

/**
 * Responsive flex stack
 * - direction="responsive": column on mobile, row on desktop
 * - direction="row": always row
 * - direction="col": always column
 */
export function ResponsiveStack({
  children,
  className,
  direction = 'responsive',
  gap = 'md',
  items = 'start',
  justify = 'start',
}: ResponsiveStackProps) {
  const directionMap = {
    row: 'flex-row',
    col: 'flex-col',
    responsive: 'flex-col md:flex-row',
  };

  const gapMap = {
    sm: 'gap-fluid-2',
    md: 'gap-fluid-3',
    lg: 'gap-fluid-4',
    xl: 'gap-fluid-6',
  };

  const itemsMap = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const justifyMap = {
    start: 'justify-start',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
  };

  return (
    <div
      className={cn(
        'flex w-full flex-wrap',
        directionMap[direction],
        gapMap[gap],
        itemsMap[items],
        justifyMap[justify],
        className
      )}
    >
      {children}
    </div>
  );
}
