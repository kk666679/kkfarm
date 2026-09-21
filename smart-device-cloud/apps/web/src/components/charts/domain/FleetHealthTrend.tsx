import { AreaChartBase } from '../base';
import { makeTimeAxisFormatter } from '../format';
import { HEALTH_COLORS } from '../theme';
import { ChartEmptyState } from '../primitives';

export interface FleetHealthPoint {
  t: string;
  healthy: number;
  degraded: number;
  unhealthy: number;
}

interface FleetHealthTrendProps {
  data: FleetHealthPoint[];
  height?: number;
  className?: string;
}

export function FleetHealthTrend({ data, height = 260, className }: FleetHealthTrendProps) {
  if (data.length === 0) {
    return <ChartEmptyState height={height} message="No health history yet." className={className} />;
  }

  const xFormatter = makeTimeAxisFormatter(data.map(d => d.t));

  return (
    <AreaChartBase
      data={data}
      xKey="t"
      height={height}
      className={className}
      ariaLabel="Fleet health over time"
      ariaDescription="Stacked area chart of healthy, degraded, and unhealthy device counts."
      xTickFormatter={xFormatter}
      series={[
        { dataKey: 'healthy', label: 'Healthy', color: HEALTH_COLORS.healthy, stackId: 'health' },
        { dataKey: 'degraded', label: 'Degraded', color: HEALTH_COLORS.degraded, stackId: 'health' },
        { dataKey: 'unhealthy', label: 'Unhealthy', color: HEALTH_COLORS.unhealthy, stackId: 'health' },
      ]}
    />
  );
}
