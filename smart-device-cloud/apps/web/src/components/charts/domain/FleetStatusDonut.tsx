import { DonutChartBase } from '../base';
import { ChartLegend, ChartA11yTable, ChartEmptyState } from '../primitives';
import { STATUS_COLORS } from '../theme';

export interface FleetStatusCounts {
  online: number;
  offline: number;
  busy: number;
  idle: number;
  error: number;
  maintenance: number;
  provisioning: number;
}

interface FleetStatusDonutProps {
  counts: FleetStatusCounts;
  height?: number;
  className?: string;
}

const LABEL: Record<keyof FleetStatusCounts, string> = {
  online: 'Online',
  offline: 'Offline',
  busy: 'Busy',
  idle: 'Idle',
  error: 'Error',
  maintenance: 'Maintenance',
  provisioning: 'Provisioning',
};

export function FleetStatusDonut({ counts, height = 260, className }: FleetStatusDonutProps) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) {
    return <ChartEmptyState height={height} message="No devices in this fleet." className={className} />;
  }

  const data = (Object.keys(LABEL) as Array<keyof FleetStatusCounts>)
    .filter(k => counts[k] > 0)
    .map(k => ({
      name: LABEL[k],
      value: counts[k],
      color: STATUS_COLORS[k],
    }));

  return (
    <div className={className}>
      <DonutChartBase
        data={data}
        height={height}
        innerRadius={62}
        outerRadius={92}
        centerLabel="devices"
        centerValue={total}
        ariaLabel={`Fleet status: ${total} devices`}
        ariaDescription={data.map(d => `${d.name}: ${d.value}`).join(', ')}
      />
      <ChartLegend
        className="mt-3 justify-center"
        entries={data.map(d => ({ label: d.name, color: d.color, value: d.value }))}
      />
      <ChartA11yTable
        caption="Fleet status counts"
        columns={[
          { key: 'name', label: 'Status' },
          { key: 'value', label: 'Count' },
        ]}
        rows={data}
      />
    </div>
  );
}
