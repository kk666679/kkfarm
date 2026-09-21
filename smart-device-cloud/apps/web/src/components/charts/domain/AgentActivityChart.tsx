import { StackedBarChart } from '../base';
import { makeTimeAxisFormatter } from '../format';
import { CHART_PALETTE } from '../theme';
import { ChartEmptyState } from '../primitives';

export interface AgentActivityPoint {
  t: string;
  started: number;
  completed: number;
  failed: number;
}

interface AgentActivityChartProps {
  data: AgentActivityPoint[];
  height?: number;
  className?: string;
}

export function AgentActivityChart({ data, height = 240, className }: AgentActivityChartProps) {
  if (data.length === 0) {
    return <ChartEmptyState height={height} message="No agent activity." className={className} />;
  }

  const xFormatter = makeTimeAxisFormatter(data.map(d => d.t));

  return (
    <StackedBarChart
      data={data}
      xKey="t"
      height={height}
      className={className}
      ariaLabel="Agent activity over time"
      ariaDescription="Stacked bar chart of agent runs started, completed, and failed."
      xTickFormatter={xFormatter}
      series={[
        { dataKey: 'completed', label: 'Completed', color: CHART_PALETTE[1] },
        { dataKey: 'failed', label: 'Failed', color: CHART_PALETTE[3] },
        { dataKey: 'started', label: 'Started', color: CHART_PALETTE[0] },
      ]}
    />
  );
}
