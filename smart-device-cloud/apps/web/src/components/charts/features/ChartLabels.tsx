import { LabelList } from 'recharts';
import { SEMANTIC_COLORS } from '../theme';

interface ChartLabelsProps {
  dataKey: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'inside' | 'insideTop' | 'insideBottom' | 'center';
  formatter?: (value: unknown) => string;
  color?: string;
  fontSize?: number;
  /** Hide labels when the data point is null/zero. Default true. */
  hideWhenZero?: boolean;
}

/**
 * LabelList wrapper. Render as a child of Bar/Line/Pie/Funnel.
 */
export function ChartLabels({
  dataKey,
  position = 'top',
  formatter,
  color,
  fontSize = 11,
  hideWhenZero = true,
}: ChartLabelsProps) {
  return (
    <LabelList
      dataKey={dataKey}
      position={position}
      fill={color ?? SEMANTIC_COLORS.muted}
      fontSize={fontSize}
      formatter={(v: unknown) => {
        if (hideWhenZero && (v === 0 || v === null || v === undefined)) return '';
        return formatter ? formatter(v) : String(v);
      }}
    />
  );
}
