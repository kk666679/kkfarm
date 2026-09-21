import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  device: string;
  timestamp: string;
  resolved: boolean;
}

export default function Alerts() {
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('active');

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['dashboard', 'alerts', filter],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        {
          id: '1',
          title: 'High CPU Usage',
          message: 'CPU usage exceeded 90%',
          severity: 'critical' as const,
          device: 'Device-001',
          timestamp: '2025-01-15T10:30:00Z',
          resolved: false,
        },
        {
          id: '2',
          title: 'Low Battery',
          message: 'Battery below 20%',
          severity: 'warning' as const,
          device: 'Device-002',
          timestamp: '2025-01-15T10:25:00Z',
          resolved: false,
        },
        {
          id: '3',
          title: 'Network Disconnect',
          message: 'Device lost network connection',
          severity: 'critical' as const,
          device: 'Device-003',
          timestamp: '2025-01-15T10:20:00Z',
          resolved: true,
        },
      ];
    },
    refetchInterval: 10000,
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAlerts = alerts?.filter((alert: Alert) => {
    if (filter === 'active') return !alert.resolved;
    if (filter === 'resolved') return alert.resolved;
    return true;
  });

  return (
    <PageContainer>
      <PageHeader
        title="Active Alerts"
        description="Manage device alerts and notifications"
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Alerts' }]}
        actions={[{ label: 'Clear All', onClick: () => {} }]}
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {alerts?.filter((a: Alert) => a.severity === 'critical' && !a.resolved).length || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Critical Alerts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {alerts?.filter((a: Alert) => a.severity === 'warning' && !a.resolved).length || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Warnings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {alerts?.filter((a: Alert) => a.resolved).length || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Resolved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Alert Timeline</CardTitle>
              <CardDescription>Recent device alerts</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('active')}
              >
                Active
              </Button>
              <Button
                variant={filter === 'resolved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('resolved')}
              >
                Resolved
              </Button>
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading alerts...</div>
            ) : filteredAlerts && filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert: Alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border rounded-lg ${
                    alert.resolved ? 'opacity-60' : ''
                  } hover:bg-accent transition-colors`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm">{alert.title}</h4>
                          <Badge className={getSeverityColor(alert.severity)} variant="outline">
                            {alert.severity}
                          </Badge>
                          {alert.resolved && (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {alert.device} • {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!alert.resolved && (
                      <Button variant="outline" size="sm">
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">No alerts found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
