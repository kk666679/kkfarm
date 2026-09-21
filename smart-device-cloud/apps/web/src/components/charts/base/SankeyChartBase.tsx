import { Sankey, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip } from '../primitives';
import { CHART_PALETTE, DEFAULT_CHART_HEIGHT } from '../theme';

export interface SankeyNode {
  name: string;
}

export interface SankeyLink {
  source: number;
  target: number;
  value: number;
}

interface SankeyChartBaseProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  height?: number;
  ariaLabel: string;
  ariaDescription?: string;
  className?: string;
  nodeWidth?: number;
  nodePadding?: number;
}

/**
 * Sankey — flow diagram.
 *
 * Recharts v3 does not expose `isAnimationActive` on Sankey. Reduced-motion
 * support is therefore delegated to the browser's CSS layer for this chart.
 */
export function SankeyChartBase({
  nodes,
  links,
  height = DEFAULT_CHART_HEIGHT,
  ariaLabel,
  ariaDescription,
  className,
  nodeWidth = 12,
  nodePadding = 10,
}: SankeyChartBaseProps) {
  return (
    <ChartContainer
      ariaLabel={ariaLabel}
      ariaDescription={ariaDescription}
      height={height}
      className={className}
    >
      <Sankey
        data={{ nodes, links }}
        node={{ stroke: 'var(--background)', strokeWidth: 1 }}
        nodePadding={nodePadding}
        nodeWidth={nodeWidth}
        link={{
          stroke: CHART_PALETTE[0],
          strokeOpacity: 0.35,
        }}
      >
        <Tooltip content={<ChartTooltip />} />
      </Sankey>
    </ChartContainer>
  );
}
