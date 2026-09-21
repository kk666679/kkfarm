import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 5 | 'auto';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Responsive grid with automatic reflow based on viewport
 * - 1 col on mobile (<480px)
 * - 2 cols on tablet (480-1023px)
 * - Scales up to specified cols on desktop (1024px+)
 * - Uses fluid gap spacing
 */
export function ResponsiveGrid({ children, className, cols = 3, gap = 'md' }: ResponsiveGridProps) {
  const gapMap = {
    none: 'gap-0',
    sm: 'gap-fluid-2',
    md: 'gap-fluid-3',
    lg: 'gap-fluid-4',
    xl: 'gap-fluid-6',
  };

  const colsMap = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
    auto: 'grid-responsive',
  };

  return (
    <div
      className={cn(
        'grid w-full grid-cols-1',
        cols !== 'auto' ? colsMap[cols] : colsMap['auto'],
        gapMap[gap],
        className
      )}
    >
      {children}
    </div>
  );
}
