import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageTitle } from '@/components/common/PageTitle';
import { useQuery } from '@tanstack/react-query';
import { cloudService } from '@/services/api';
import {
  Search,
  Filter,
  Download,
  Shield,
  FileText,
  AlertTriangle,
  Info,
  XCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const {
    data: events,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['dashboard', 'audit'],
    queryFn: () => cloudService.getAuditEvents(50),
  });

  const filtered = (events ?? []).filter(event => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      event.action.toLowerCase().includes(q) ||
      event.user.toLowerCase().includes(q) ||
      event.resource.toLowerCase().includes(q) ||
      event.description.toLowerCase().includes(q)
    );
  });

  const total = events?.length ?? 0;
  const alerts = events?.filter(e => e.severity === 'error').length ?? 0;
  const successRate =
    total > 0
      ? Math.round((events!.filter(e => e.severity === 'success').length / total) * 1000) / 10
      : 100;

  return (
    <div className="space-y-6">
      <PageTitle title="Audit" subtitle="Security events and compliance logs" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{alerts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{successRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Last Event</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events && events.length > 0
                ? new Date(events[0]!.timestamp).toLocaleDateString()
                : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search audit logs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Log</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading audit events...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">
              Failed to load audit events: {(error as Error).message}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-400">No audit events found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="pb-3">Action</th>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Resource</th>
                  <th className="pb-3">Severity</th>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Description</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(event => {
                  const cfg = severityConfig[event.severity as keyof typeof severityConfig];
                  const Icon = cfg.icon;
                  return (
                    <tr key={event.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="py-3 font-medium">
                        <Shield className="inline h-3.5 w-3.5 mr-1 text-slate-500" />
                        {event.action}
                      </td>
                      <td className="py-3 text-slate-400">{event.user}</td>
                      <td className="py-3 text-slate-400">{event.resource}</td>
                      <td className="py-3">
                        <span
                          className={`${cfg.color} ${cfg.bg} px-2 py-0.5 rounded text-xs flex items-center gap-1 w-fit`}
                        >
                          <Icon className="h-3 w-3" />
                          {event.severity}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">
                        {new Date(event.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 text-slate-400 max-w-xs truncate">{event.description}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const severityConfig = {
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  success: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
};
