import { useMemo } from 'react';
import { BarChartBase } from '../base';
import { SEMANTIC_COLORS } from '../theme';
import { ChartEmptyState } from '../primitives';

interface BatteryDistributionChartProps {
  /** Battery percentages (0-100). */
  values: number[];
  height?: number;
  className?: string;
}

const BUCKETS = [
  { label: '0–20%', lo: 0, hi: 20, color: SEMANTIC_COLORS.danger },
  { label: '20–40%', lo: 20, hi: 40, color: SEMANTIC_COLORS.warning },
  { label: '40–60%', lo: 40, hi: 60, color: SEMANTIC_COLORS.warning },
  { label: '60–80%', lo: 60, hi: 80, color: SEMANTIC_COLORS.success },
  { label: '80–100%', lo: 80, hi: 101, color: SEMANTIC_COLORS.success },
];

export function BatteryDistributionChart({
  values,
  height = 200,
  className,
}: BatteryDistributionChartProps) {
  const data = useMemo(() => {
    return BUCKETS.map(b => ({
      bucket: b.label,
      count: values.filter(v => v >= b.lo && v < b.hi).length,
      color: b.color,
    }));
  }, [values]);

  if (values.length === 0) {
    return <ChartEmptyState height={height} message="No battery data." className={className} />;
  }

  return (
    <BarChartBase
      data={data}
      xKey="bucket"
      height={height}
      className={className}
      ariaLabel="Battery distribution"
      ariaDescription="Histogram of devices by battery percentage band."
      showLegend={false}
      series={[{ dataKey: 'count', label: 'Devices', color: SEMANTIC_COLORS.success }]}
    />
  );
}
