import { BarChartBase, type BarSeries } from './BarChartBase';

interface StackedBarChartProps {
  data: ReadonlyArray<any>;
  xKey: string;
  series: BarSeries[];
  height?: number;
  ariaLabel: string;
  ariaDescription?: string;
  className?: string;
  layout?: 'horizontal' | 'vertical';
  xTickFormatter?: (v: string) => string;
  yTickFormatter?: (v: number) => string;
}

/** BarChartBase with all series forced into a single stack. */
export function StackedBarChart({ series, ...rest }: StackedBarChartProps) {
  const stacked = series.map(s => ({ ...s, stackId: s.stackId ?? 'stack' }));
  return <BarChartBase {...rest} series={stacked} />;
}
