import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PageTitle } from '@/components/common/PageTitle';
import { useQuery } from '@tanstack/react-query';
import { cloudService } from '@/services/api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, BarChart3, Eye } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: utilization, isLoading } = useQuery({
    queryKey: ['dashboard', 'utilization'],
    queryFn: () => cloudService.getDeviceUtilization(24),
    refetchInterval: 60000,
  });

  const { data: metrics } = useQuery({
    queryKey: ['fleet', 'metrics'],
    queryFn: () => cloudService.getFleetMetrics(),
  });

  return (
    <div className="space-y-6">
      <PageTitle title="Analytics" subtitle="Usage patterns and performance insights" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Page Views" value="128.4K" change="+12.5%" icon={Eye} />
        <MetricCard label="Avg Session" value="4m 32s" change="+5.2%" icon={Activity} />
        <MetricCard label="Bounce Rate" value="24.3%" change="-3.1%" icon={TrendingDown} />
        <MetricCard label="Conversion" value="3.8%" change="+0.8%" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Utilization Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !utilization ? (
              <div className="h-80 flex items-center justify-center text-slate-400">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={utilization}>
                  <defs>
                    <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="utilization"
                    stroke="#3b82f6"
                    fill="url(#colorUtil)"
                    name="Utilization %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !metrics ? (
              <div className="h-80 flex items-center justify-center text-slate-400">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart
                  data={[
                    { time: 'CPU', value: metrics.avgCpuUsage },
                    { time: 'Memory', value: metrics.avgMemoryUsage },
                    { time: 'Temp', value: metrics.avgTemperature },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <BarRow label="API Requests" value="2.4M" percent={78} />
              <BarRow label="WebSocket Conn" value="412" percent={65} />
              <BarRow label="Telemetry Ingest" value="890K" percent={92} />
              <BarRow label="Cloud Functions" value="312" percent={45} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <GeoRow region="Singapore" devices={Math.round((metrics?.totalDevices ?? 0) * 0.3)} />
              <GeoRow region="Tokyo" devices={Math.round((metrics?.totalDevices ?? 0) * 0.25)} />
              <GeoRow region="London" devices={Math.round((metrics?.totalDevices ?? 0) * 0.2)} />
              <GeoRow
                region="Frankfurt"
                devices={Math.round((metrics?.totalDevices ?? 0) * 0.15)}
              />
              <GeoRow region="Virginia" devices={Math.round((metrics?.totalDevices ?? 0) * 0.1)} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Report Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <ReportRow name="Weekly Summary" date="Sep 8, 2024" />
              <ReportRow name="Monthly Analytics" date="Sep 1, 2024" />
              <ReportRow name="Q2 Performance" date="Jul 1, 2024" />
              <ReportRow name="H1 Review" date="Jun 30, 2024" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  change,
  icon: Icon,
}: {
  label: string;
  value: string;
  change: string;
  icon: any;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-400">{label}</CardTitle>
          <Icon className="h-4 w-4 text-slate-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`text-xs ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
          {change}
        </div>
      </CardContent>
    </Card>
  );
}

function BarRow({ label, value, percent }: { label: string; value: string; percent: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="text-slate-400">{value}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full">
        <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function GeoRow({ region, devices }: { region: string; devices: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-300">{region}</span>
      <span className="font-medium">{devices}</span>
    </div>
  );
}

function ReportRow({ name, date }: { name: string; date: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium">{name}</div>
        <div className="text-xs text-slate-400">{date}</div>
      </div>
      <BarChart3 className="h-4 w-4 text-slate-500" />
    </div>
  );
}
