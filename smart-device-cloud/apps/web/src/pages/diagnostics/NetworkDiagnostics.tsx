'use client';

import { useQuery } from '@tanstack/react-query';
import { getRegionalMetrics, getHealthMetrics } from '@/services/api.service';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Globe } from 'lucide-react';

const regionLabels: Record<string, string> = {
  singapore: 'Singapore',
  tokyo: 'Tokyo',
  london: 'London',
  frankfurt: 'Frankfurt',
  virginia: 'Virginia',
};

export default function NetworkPanel() {
  const { data: regions } = useQuery({
    queryKey: ['regional-metrics'],
    queryFn: getRegionalMetrics,
    refetchInterval: 30_000,
  });

  const { data: health } = useQuery({
    queryKey: ['health-metrics'],
    queryFn: getHealthMetrics,
    refetchInterval: 60_000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Network Infrastructure</h1>
        <p className="text-sm text-white/60">Cloud region health and device distribution</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {regions?.map(region => (
          <Card key={region.region} className="border-white/5 bg-[#0f1525] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-white/50" />
                <h3 className="text-sm font-semibold text-white">
                  {regionLabels[region.region] ?? region.region}
                </h3>
              </div>
              <span
                className={`text-xs font-medium ${region.isHealthy ? 'text-emerald-400' : 'text-red-400'}`}
              >
                {region.isHealthy ? 'Healthy' : 'Degraded'}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/60">
              <div>Devices: {region.deviceCount}</div>
              <div>Online: {Math.round(region.onlinePercent)}%</div>
              <div>Latency: {region.avgLatency}ms</div>
              <div>Packet loss: {region.packetLoss}%</div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Network health</span>
                <span>{Math.round(region.networkHealthScore)}%</span>
              </div>
              <Progress value={region.networkHealthScore} />
            </div>
          </Card>
        ))}
      </div>

      {health && (
        <Card className="border-white/5 bg-[#0f1525] p-4">
          <h3 className="text-sm font-semibold text-white">Fleet Health Overview</h3>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
            <HealthMetric label="Device Availability" value={health.deviceAvailability} />
            <HealthMetric label="CPU Health" value={health.cpuHealth} />
            <HealthMetric label="Memory Health" value={health.memoryHealth} />
            <HealthMetric label="Network Health" value={health.networkHealth} />
            <HealthMetric label="Application Health" value={health.applicationHealth} />
            <HealthMetric label="Automation Success" value={health.automationSuccessRate} />
          </div>
        </Card>
      )}
    </div>
  );
}

function HealthMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs text-white/60">{label}</p>
      <p className="text-lg font-semibold text-white">{Math.round(value)}%</p>
      <Progress value={value} />
    </div>
  );
}
