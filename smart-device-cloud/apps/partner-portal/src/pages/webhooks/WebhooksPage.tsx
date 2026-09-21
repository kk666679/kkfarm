import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageTitle } from '@/components/common/PageTitle';
import { Plus, Trash2, Edit2, Power } from 'lucide-react';

export default function WebhooksPage() {
  const [hooks, setHooks] = useState([
    {
      id: 'wh-1',
      url: 'https://acme.app/webhooks/sdc-events',
      events: ['device.online', 'device.offline'],
      active: true,
    },
    {
      id: 'wh-2',
      url: 'https://acme.app/webhooks/workload',
      events: ['workload.completed', 'workload.failed'],
      active: true,
    },
  ]);
  const [url, setUrl] = useState('');

  function add() {
    if (!url.trim()) return;
    setHooks(prev => [
      ...prev,
      {
        id: `wh-${Date.now()}`,
        url,
        events: ['device.online', 'workflow.completed'],
        active: true,
      },
    ]);
    setUrl('');
  }

  function toggle(id: string) {
    setHooks(prev => prev.map(h => (h.id === id ? { ...h, active: !h.active } : h)));
  }

  return (
    <div className="space-y-6">
      <PageTitle title="Webhooks" subtitle="Manage webhook subscriptions" />

      <Card>
        <CardHeader>
          <CardTitle>Active Webhooks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {hooks.map(h => (
              <div
                key={h.id}
                className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${h.active ? 'bg-green-500' : 'bg-slate-600'}`}
                    />
                    <span className="font-medium text-sm">{h.url}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 ml-4">{h.events.join(', ')}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => toggle(h.id)}>
                    <Power
                      className={`h-4 w-4 ${h.active ? 'text-green-400' : 'text-slate-500'}`}
                    />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Webhook</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://your-endpoint.com/hook"
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
            <Button onClick={add}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
