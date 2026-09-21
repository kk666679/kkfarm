import { LineChartBase } from '../base';
import { makeTimeAxisFormatter, formatPercent } from '../format';
import { SEMANTIC_COLORS } from '../theme';
import { ChartEmptyState } from '../primitives';
import { ReferenceLines } from '../features';

export interface ErrorRatePoint {
  t: string;
  rate: number;
}

interface ErrorRateChartProps {
  data: ErrorRatePoint[];
  /** SLO threshold — draws a horizontal reference line. Default 5%. */
  sloPercent?: number;
  height?: number;
  className?: string;
}

export function ErrorRateChart({
  data,
  sloPercent = 5,
  height = 220,
  className,
}: ErrorRateChartProps) {
  if (data.length === 0) {
    return <ChartEmptyState height={height} message="No error data." className={className} />;
  }

  const xFormatter = makeTimeAxisFormatter(data.map(d => d.t));

  return (
    <LineChartBase
      data={data}
      xKey="t"
      height={height}
      className={className}
      ariaLabel="Error rate over time"
      ariaDescription={`Line chart of error rate, with a ${sloPercent}% SLO threshold.`}
      xTickFormatter={xFormatter}
      yTickFormatter={v => formatPercent(v, 1)}
      series={[{ dataKey: 'rate', label: 'Error rate', color: SEMANTIC_COLORS.danger }]}
    >
      <ReferenceLines
        lines={[
          {
            y: sloPercent,
            label: `SLO ${sloPercent}%`,
            color: SEMANTIC_COLORS.warning,
          },
        ]}
      />
    </LineChartBase>
  );
}
