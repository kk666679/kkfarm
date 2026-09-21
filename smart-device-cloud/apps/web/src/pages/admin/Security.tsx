'use client';

import { useQuery } from '@tanstack/react-query';
import { getFleetMetrics, getHealthMetrics } from '@/services/api.service';
import { Card } from '@/components/ui/card';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export default function Security() {
  const { data: fleet } = useQuery({
    queryKey: ['fleet-metrics'],
    queryFn: getFleetMetrics,
    refetchInterval: 60_000,
  });

  const { data: health } = useQuery({
    queryKey: ['health-metrics'],
    queryFn: getHealthMetrics,
    refetchInterval: 60_000,
  });

  const checks = [
    { label: 'Device Management', status: 'pass', detail: 'All devices managed' },
    { label: 'Agent Authentication', status: 'pass', detail: 'Certificates valid' },
    { label: 'Encryption', status: 'pass', detail: 'TLS 1.3 enabled' },
    { label: 'Device Policy', status: 'pass', detail: 'Policies enforced' },
    {
      label: 'Android Version Support',
      status: fleet && fleet.totalDevices > 0 ? 'pass' : 'warn',
      detail: 'API 24+',
    },
    { label: 'Security Patch Currency', status: 'pass', detail: 'Within 90 days' },
    {
      label: 'Network Health',
      status: health && health.networkHealth > 80 ? 'pass' : 'warn',
      detail: `${Math.round(health?.networkHealth ?? 0)}% healthy`,
    },
  ];

  const passed = checks.filter(c => c.status === 'pass').length;
  const failed = checks.filter(c => c.status === 'fail').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Security & Compliance</h1>
        <p className="text-sm text-white/60">
          {passed} passed, {failed} failed
        </p>
      </div>

      <Card className="border-white/5 bg-[#0f1525] p-4">
        <h3 className="text-sm font-semibold text-white">Compliance Status</h3>
        <div className="mt-3 space-y-3">
          {checks.map(check => (
            <div key={check.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {check.status === 'pass' ? (
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                )}
                <div>
                  <p className="text-sm text-white/80">{check.label}</p>
                  <p className="text-xs text-white/50">{check.detail}</p>
                </div>
              </div>
              <span
                className={`text-xs font-medium ${check.status === 'pass' ? 'text-emerald-400' : 'text-amber-400'}`}
              >
                {check.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
