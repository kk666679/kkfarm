import { FunnelChartBase } from '../base';
import { CHART_PALETTE } from '../theme';

export interface ProvisioningStages {
  requested: number;
  allocated: number;
  configured: number;
  ready: number;
  active: number;
}

interface ProvisioningFunnelProps {
  stages: ProvisioningStages;
  height?: number;
  className?: string;
}

const LABEL: Record<keyof ProvisioningStages, string> = {
  requested: 'Requested',
  allocated: 'Allocated',
  configured: 'Configured',
  ready: 'Ready',
  active: 'Active',
};

export function ProvisioningFunnel({
  stages,
  height = 320,
  className,
}: ProvisioningFunnelProps) {
  const data = (Object.keys(LABEL) as Array<keyof ProvisioningStages>)
    .map((k, i) => ({
      name: LABEL[k],
      value: stages[k],
      fill: CHART_PALETTE[i % CHART_PALETTE.length],
    }))
    .filter(stage => stage.value > 0);

  if (data.length === 0) return null;

  return (
    <FunnelChartBase
      data={data}
      height={height}
      className={className}
      showConversion
      ariaLabel="Provisioning funnel"
      ariaDescription="Stages from request through active device."
    />
  );
}
