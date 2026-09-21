'use client';

import { useQuery } from '@tanstack/react-query';
import { getAuditLog } from '@/services/api.service';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Download } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { AuditLogEntry } from '@smart-device-cloud/shared';

const actionLabels: Record<string, string> = {
  device_state_change: 'Device State Change',
  workload_start: 'Workload Start',
  workload_stop: 'Workload Stop',
  application_deploy: 'Application Deploy',
  config_change: 'Config Change',
  auth_login: 'Auth Login',
  auth_logout: 'Auth Logout',
  maintenance_enter: 'Maintenance Enter',
  maintenance_exit: 'Maintenance Exit',
  quarantine: 'Quarantine',
  workflow_create: 'Workflow Create',
  workflow_execute: 'Workflow Execute',
};

export default function AuditLog() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['audit-log'],
    queryFn: getAuditLog,
    refetchInterval: 30_000,
  });

  const entries = data ?? [];

  const filtered = entries.filter((entry: AuditLogEntry) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const description = String(entry.description ?? entry.details?.description ?? '');
    const operatorId = entry.operatorId ?? entry.actor ?? '';
    const targetId = entry.targetId ?? entry.resourceId ?? '';
    return (
      description.toLowerCase().includes(q) ||
      String(operatorId).toLowerCase().includes(q) ||
      String(targetId).toLowerCase().includes(q) ||
      actionLabels[entry.action]?.toLowerCase().includes(q)
    );
  });

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Log</h1>
          <p className="text-sm text-white/60">{entries.length} entries</p>
        </div>
        <Button variant="secondary" size="sm" onClick={exportJson}>
          <Download className="mr-2 h-4 w-4" />
          Export JSON
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <Input
          placeholder="Search audit log..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64 pl-9"
        />
      </div>

      <Card className="border-white/5 bg-[#0f1525]">
        <ScrollArea className="h-[600px]">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map((entry: AuditLogEntry) => (
                <div key={entry.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {actionLabels[entry.action] ?? entry.action}
                      </Badge>
                      <span className="text-xs text-white/50">
                        {entry.operatorId ?? entry.actor ?? 'system'}
                      </span>
                    </div>
                    <span className="text-xs text-white/40">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-white/80">{entry.description ?? 'Audit event'}</p>
                  {(entry.targetId ?? entry.resourceId) && (
                    <p className="mt-1 text-xs text-white/40">
                      Target: {entry.targetId ?? entry.resourceId}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}
