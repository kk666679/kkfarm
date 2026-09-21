import { Tooltip, Treemap } from 'recharts';
import { ChartContainer, ChartTooltip } from '../primitives';
import { CHART_PALETTE, DEFAULT_CHART_HEIGHT, prefersReducedMotion } from '../theme';

export interface TreemapNode {
  name: string;
  size: number;
  color?: string;
  children?: TreemapNode[];
}

interface TreemapBaseProps {
  data: TreemapNode[];
  height?: number;
  ariaLabel: string;
  ariaDescription?: string;
  className?: string;
  dataKey?: string;
}

export function TreemapBase({
  data,
  height = DEFAULT_CHART_HEIGHT,
  ariaLabel,
  ariaDescription,
  className,
  dataKey = 'size',
}: TreemapBaseProps) {
  const noAnim = prefersReducedMotion();
  const colored = data.map((node, i) => ({
    ...node,
    color: node.color ?? CHART_PALETTE[i % CHART_PALETTE.length],
  }));

  return (
    <ChartContainer
      ariaLabel={ariaLabel}
      ariaDescription={ariaDescription}
      height={height}
      className={className}
    >
      {/*
        Recharts' TreemapDataType requires an index signature on nested
        children. `TreemapNode` is an interface without one, so we widen at
        the call site — Treemap itself treats the payload opaquely.
      */}
      <Treemap
        data={colored as unknown as ReadonlyArray<Record<string, unknown>>}
        dataKey={dataKey}
        stroke="var(--background)"
        fill="var(--muted, #e2e8f0)"
        isAnimationActive={!noAnim}
        content={<TreemapCell />}
      >
        <Tooltip content={<ChartTooltip />} />
      </Treemap>
    </ChartContainer>
  );
}

function TreemapCell(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  color?: string;
  depth?: number;
}) {
  const { x = 0, y = 0, width = 0, height = 0, name, color, depth } = props;
  if (depth === 1 || width < 40 || height < 20) return null;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: color,
          stroke: 'var(--background)',
          strokeWidth: 2,
          strokeLinejoin: 'round',
        }}
      />
      <text
        x={x + 8}
        y={y + 18}
        fill="#fff"
        fontSize={11}
        fontWeight={500}
        style={{ pointerEvents: 'none' }}
      >
        {name}
      </text>
    </g>
  );
}
