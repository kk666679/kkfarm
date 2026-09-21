import { ErrorBar } from 'recharts';

/**
 * ErrorBar wrapper — attach to a Line/Bar/Scatter to show variance.
 * Usage:
 *
 *   <Line dataKey="mean" ...>
 *     <ErrorBarSeries dataKey="stddev" />
 *   </Line>
 */
export function ErrorBarSeries({
  dataKey,
  direction = 'y',
  width = 4,
  strokeWidth = 1.5,
  stroke = 'currentColor',
}: {
  dataKey: string;
  direction?: 'x' | 'y';
  width?: number;
  strokeWidth?: number;
  stroke?: string;
}) {
  return (
    <ErrorBar
      dataKey={dataKey}
      direction={direction}
      width={width}
      strokeWidth={strokeWidth}
      stroke={stroke}
    />
  );
}
