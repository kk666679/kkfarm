'use client';

import { useQuery } from '@tanstack/react-query';
import { getApplications } from '@/services/api.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, RotateCcw } from 'lucide-react';
import type { Application } from '@smart-device-cloud/shared';

const healthColor: Record<NonNullable<Application['healthStatus']>, string> = {
  healthy: 'text-emerald-400',
  degraded: 'text-amber-400',
  unhealthy: 'text-red-400',
  unknown: 'text-white/40',
};

export default function Applications() {
  const { data, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
    refetchInterval: 60_000,
  });

  const applications = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Applications</h1>
          <p className="text-sm text-white/60">{applications.length} applications</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {applications.map((app: Application) => (
            <Card key={app.id} className="border-white/5 bg-[#0f1525] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">{app.packageName}</h3>
                  <p className="text-xs text-white/50">
                    v{app.versionName} ({app.versionCode})
                  </p>
                </div>
                <span
                  className={`text-xs font-medium ${healthColor[app.healthStatus ?? 'unknown']}`}
                >
                  {app.healthStatus ?? 'unknown'}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-white/60">
                <div>Installed: {app.installedDeviceCount}</div>
                <div>Healthy: {app.healthyDeviceCount}</div>
                <div>Failed: {app.failedDeviceCount}</div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Installation</span>
                  <span>{app.installStatus}</span>
                </div>
                <Progress
                  value={
                    app.installStatus === 'installed'
                      ? 100
                      : app.installStatus === 'installing'
                        ? 50
                        : 0
                  }
                />
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Button size="sm" variant="secondary" className="flex-1">
                  <RefreshCw className="mr-1 h-3.5 w-3.5" />
                  Update
                </Button>
                <Button size="sm" variant="ghost">
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
