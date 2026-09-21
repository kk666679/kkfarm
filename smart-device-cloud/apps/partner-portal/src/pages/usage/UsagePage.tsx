import React from 'react';
import { usePartnerUsage } from '@/hooks/usePartnerApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PageTitle } from '@/components/common/PageTitle';
import {
  DollarSign,
  Wallet,
  HardDrive,
  Server,
  TrendingUp,
  CreditCard,
  FileText,
  BarChart3,
} from 'lucide-react';

export default function UsagePage() {
  const { data: usage, isLoading } = usePartnerUsage();

  const apiCalls = usage?.apiCalls ?? 142857;
  const apiLimit = usage?.apiLimit ?? 500000;
  const storage = usage?.storage ?? 2.4;
  const storageLimit = usage?.storageLimit ?? 10;

  return (
    <div className="space-y-6">
      <PageTitle title="Usage" subtitle="Monitor API usage and billing metrics" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">API Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiCalls.toLocaleString()}</div>
            <div className="text-xs text-slate-400">of {apiLimit.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Storage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storage} GB</div>
            <div className="text-xs text-slate-400">of {storageLimit} GB</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage?.devices ?? 42}</div>
            <div className="text-xs text-slate-400">Registered</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Current Bill</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$499.00</div>
            <div className="text-xs text-slate-400">Monthly</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>API Usage Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <UsageBar
                icon={BarChart3}
                label="Read Requests"
                value={Math.round(apiCalls * 0.6)}
                total={apiLimit}
                color="bg-blue-500"
              />
              <UsageBar
                icon={Server}
                label="Write Requests"
                value={Math.round(apiCalls * 0.25)}
                total={apiLimit}
                color="bg-green-500"
              />
              <UsageBar
                icon={TrendingUp}
                label="Stream Connections"
                value={Math.round(apiCalls * 0.1)}
                total={apiLimit}
                color="bg-purple-500"
              />
              <UsageBar
                icon={DollarSign}
                label="Compute"
                value={Math.round(apiCalls * 0.05)}
                total={apiLimit}
                color="bg-orange-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Cycle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-slate-300">Current Cycle</span>
                </div>
                <span className="font-medium">Sep 2024</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-300">Next Invoice</span>
                </div>
                <span className="font-medium">Oct 1, 2024</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-slate-300">Amount Due</span>
                </div>
                <span className="font-medium">$499.00</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-300">Auto-Renew</span>
                </div>
                <span className="text-green-400">Enabled</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UsageBar({
  icon: Icon,
  label,
  value,
  total,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-slate-400" />
          <span>{label}</span>
        </div>
        <span className="text-slate-400">
          {value.toLocaleString()} ({pct.toFixed(1)}%)
        </span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full">
        <div className={`h-2 ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
