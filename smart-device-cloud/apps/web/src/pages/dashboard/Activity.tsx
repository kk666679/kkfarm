import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, RefreshCw, Search } from 'lucide-react';

interface Activity {
  id: string;
  timestamp: string;
  device: string;
  action: string;
  status: 'success' | 'failed' | 'pending';
  details: string;
}

export default function Activity() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const {
    data: activities,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['dashboard', 'activity', searchQuery, filterType],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        {
          id: '1',
          timestamp: '2025-01-15T10:30:00Z',
          device: 'Device-001',
          action: 'Screenshot',
          status: 'success' as const,
          details: 'Screenshot captured successfully',
        },
        {
          id: '2',
          timestamp: '2025-01-15T10:25:00Z',
          device: 'Device-002',
          action: 'App Install',
          status: 'success' as const,
          details: 'com.example.app installed',
        },
        {
          id: '3',
          timestamp: '2025-01-15T10:20:00Z',
          device: 'Device-003',
          action: 'Reboot',
          status: 'failed' as const,
          details: 'Device timeout',
        },
      ];
    },
    refetchInterval: 5000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Activity Stream"
        description="Real-time device events and actions"
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Activity' }]}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Live event stream from all devices</CardDescription>
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={() => refetch()}
              className="animate-pulse"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={value => setFilterType(value ?? 'all')}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading events...</div>
            ) : activities && activities.length > 0 ? (
              activities.map((activity: Activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                      <span className="font-medium text-sm">{activity.action}</span>
                      <span className="text-xs text-muted-foreground">{activity.device}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">No events found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
