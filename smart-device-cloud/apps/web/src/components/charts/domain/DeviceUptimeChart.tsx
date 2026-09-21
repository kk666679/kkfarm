import { AreaChartBase } from '../base';
import { makeTimeAxisFormatter, formatPercent } from '../format';
import { SEMANTIC_COLORS } from '../theme';
import { ChartEmptyState } from '../primitives';
import { ReferenceLines } from '../features';

export interface UptimePoint {
  t: string;
  /** Uptime percentage (0–100). */
  uptime: number;
}

interface DeviceUptimeChartProps {
  data: UptimePoint[];
  /** SLO line. Default 99%. */
  sloPercent?: number;
  height?: number;
  className?: string;
}

export function DeviceUptimeChart({
  data,
  sloPercent = 99,
  height = 220,
  className,
}: DeviceUptimeChartProps) {
  if (data.length === 0) {
    return <ChartEmptyState height={height} message="No uptime data." className={className} />;
  }

  const xFormatter = makeTimeAxisFormatter(data.map(d => d.t));

  return (
    <AreaChartBase
      data={data}
      xKey="t"
      height={height}
      className={className}
      ariaLabel="Device uptime"
      ariaDescription={`Area chart of device uptime with a ${sloPercent}% SLO line.`}
      xTickFormatter={xFormatter}
      yTickFormatter={v => formatPercent(v, 1)}
      series={[
        {
          dataKey: 'uptime',
          label: 'Uptime',
          color: SEMANTIC_COLORS.success,
          fillOpacity: 0.2,
        },
      ]}
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
    </AreaChartBase>
  );
}
