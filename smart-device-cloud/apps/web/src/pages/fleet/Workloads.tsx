'use client';

import { useQuery } from '@tanstack/react-query';
import { getWorkloads } from '@/services/api.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Square, Eye } from 'lucide-react';
import type { Workload } from '@smart-device-cloud/shared';

const categoryLabels: Record<NonNullable<Workload['category']>, string> = {
  'QA Testing': 'QA Testing',
  qa_testing: 'QA Testing',
  'App Monitoring': 'App Monitoring',
  Automation: 'Automation',
  'Data Collection': 'Data Collection',
  'Regression Testing': 'Regression Testing',
  Maintenance: 'Maintenance',
  'Scheduled Jobs': 'Scheduled Jobs',
  automation: 'Automation',
};

export default function Workloads() {
  const { data, isLoading } = useQuery({
    queryKey: ['workloads'],
    queryFn: getWorkloads,
    refetchInterval: 10_000,
  });

  const workloads = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workloads</h1>
          <p className="text-sm text-white/60">{workloads.length} workloads</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {workloads.map((workload: Workload) => (
            <Card key={workload.id} className="border-white/5 bg-[#0f1525] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">{workload.name}</h3>
                  <p className="text-xs text-white/50">{categoryLabels[workload.category]}</p>
                </div>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/70 capitalize">
                  {workload.status}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Progress</span>
                  <span>{Math.round(workload.progressPercent)}%</span>
                </div>
                <Progress value={workload.progressPercent} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/60">
                <div>Devices: {workload.deviceIds.length}</div>
                <div>Failures: {workload.failureCount}</div>
                <div>Runtime: {Math.round(workload.runtimeSeconds)}s</div>
                <div>Success: {Math.round(workload.successRate)}%</div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Button size="sm" className="flex-1">
                  <Play className="mr-1 h-3.5 w-3.5" />
                  Start
                </Button>
                <Button size="sm" variant="secondary" className="flex-1">
                  <Square className="mr-1 h-3.5 w-3.5" />
                  Stop
                </Button>
                <Button size="sm" variant="ghost">
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
