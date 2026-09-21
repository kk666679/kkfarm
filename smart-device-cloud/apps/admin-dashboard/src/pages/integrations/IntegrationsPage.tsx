import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageTitle } from '@/components/common/PageTitle';
import { useQuery } from '@tanstack/react-query';
import { cloudService } from '@/services/api';
import { Plus, Trash2, Edit2, RefreshCw, Settings, Loader2 } from 'lucide-react';

export default function IntegrationsPage() {
  const {
    data: integrations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['dashboard', 'integrations'],
    queryFn: () => cloudService.getIntegrations(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageTitle title="Integrations" subtitle="Connect and manage third-party integrations" />
        <div className="flex items-center justify-center py-12 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading integrations...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageTitle title="Integrations" subtitle="Connect and manage third-party integrations" />
        <div className="text-center py-12 text-red-400">
          Failed to load integrations: {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle title="Integrations" subtitle="Connect and manage third-party integrations" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {integrations && integrations.length > 0 ? (
          integrations.map(integration => (
            <IntegrationCard key={integration.name} {...integration} />
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-slate-400">
            No integrations available
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <WebhookRow
              url="https://acme.app/webhooks/sdc-events"
              events={['device.online', 'device.offline']}
            />
            <WebhookRow
              url="https://acme.app/webhooks/workload-status"
              events={['workload.completed', 'workload.failed']}
            />
          </div>
          <Button variant="outline" className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Add Webhook
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function IntegrationCard({
  name,
  category,
  connected,
  description,
}: {
  name: string;
  category: string;
  connected: boolean;
  description: string;
}) {
  return (
    <Card className={connected ? 'border-green-500/30' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{name}</CardTitle>
          <div
            className={`px-2 py-0.5 text-xs rounded-full ${connected ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-slate-400'}`}
          >
            {connected ? 'Connected' : 'Available'}
          </div>
        </div>
        <p className="text-xs text-slate-400">{category}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-300 mb-4">{description}</p>
        <div className="flex items-center gap-2">
          <Button size="sm" variant={connected ? 'outline' : 'default'}>
            {connected ? (
              <>
                <RefreshCw className="mr-1 h-3.5 w-3.5" /> Sync
              </>
            ) : (
              'Connect'
            )}
          </Button>
          {connected && (
            <>
              <Button size="sm" variant="ghost">
                <Settings className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function WebhookRow({ url, events }: { url: string; events: string[] }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
      <div>
        <div className="text-sm font-medium">{url}</div>
        <div className="text-xs text-slate-400">{events.join(', ')}</div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
