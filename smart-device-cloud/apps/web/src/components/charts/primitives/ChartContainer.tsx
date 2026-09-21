import { forwardRef, type ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { DEFAULT_CHART_HEIGHT } from '../theme';

interface ChartContainerProps {
  children: ReactNode;
  /** Accessible label for the chart region. */
  ariaLabel: string;
  /** Optional description exposed to screen readers. */
  ariaDescription?: string;
  height?: number;
  className?: string;
  /** Screen-reader-only data table fallback. */
  a11yTable?: ReactNode;
}

/**
 * ChartContainer — wraps recharts in a sized, labelled region.
 *
 * Recharts' ResponsiveContainer needs a parent with an explicit height,
 * otherwise it collapses to 0. This component provides that.
 *
 * Accessibility: the chart svg gets role="img" and aria-label. Detailed
 * data is exposed via an sr-only table (see ChartA11yTable).
 */
export const ChartContainer = forwardRef<HTMLDivElement, ChartContainerProps>(
  function ChartContainer(
    { children, ariaLabel, ariaDescription, height = DEFAULT_CHART_HEIGHT, className, a11yTable },
    ref
  ) {
    return (
      <div ref={ref} className={cn('relative w-full', className)}>
        <div
          role="img"
          aria-label={ariaLabel}
          aria-describedby={ariaDescription ? `${ariaLabel}-desc` : undefined}
          style={{ width: '100%', height }}
        >
          <ResponsiveContainer width="100%" height="100%">
            {children as React.ReactElement}
          </ResponsiveContainer>
        </div>
        {ariaDescription && (
          <span id={`${ariaLabel}-desc`} className="sr-only">
            {ariaDescription}
          </span>
        )}
        {a11yTable}
      </div>
    );
  }
);
