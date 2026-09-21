import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageTitle } from '@/components/common/PageTitle';
import { useQuery } from '@tanstack/react-query';
import { cloudService } from '@/services/api';
import { Terminal, Play, Copy, Check, Globe, Cpu, Zap, Server, Loader2 } from 'lucide-react';

export default function McpPage() {
  const [output, setOutput] = useState('');
  const { data: devices, isLoading } = useQuery({
    queryKey: ['dashboard', 'devices'],
    queryFn: () => cloudService.getDevices(),
  });

  const runTool = async (tool: string) => {
    setOutput(`Running ${tool}...`);
    try {
      if (tool === 'discover') {
        const res = await cloudService.getDevices();
        setOutput(`Discovered ${res.length} devices`);
      } else if (tool === 'list-tools') {
        setOutput('Available tools: device-list, workload-manage, telemetry-stream, audit-query');
      } else if (tool === 'call-tool') {
        const online = (devices ?? []).filter(d => d.status === 'online').length;
        setOutput(`Executed device-list with status=online → ${online} devices`);
      } else {
        setOutput(`Tool ${tool} executed`);
      }
    } catch (err) {
      setOutput(`Error: ${(err as Error).message}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle title="MCP" subtitle="Model Context Protocol tools and server capabilities" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Tools Registered" value="12" icon={Zap} />
        <MetricCard label="Servers" value="3" icon={Server} />
        <MetricCard label="Contexts" value="48" icon={Globe} />
        <MetricCard label="CPU" value="23%" icon={Cpu} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Server Discovery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-slate-400">Available MCP Servers:</div>
              <div className="space-y-2">
                <ServerEntry
                  name="Device MCP"
                  tools={['device-list', 'device-info', 'device-action']}
                  status="active"
                />
                <ServerEntry
                  name="Workflow MCP"
                  tools={['workflow-run', 'workflow-status']}
                  status="active"
                />
                <ServerEntry
                  name="Telemetry MCP"
                  tools={['telemetry-stream', 'metrics-query']}
                  status="active"
                />
                <ServerEntry
                  name="Audit MCP"
                  tools={['audit-query', 'audit-export']}
                  status="maintenance"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tool Executor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" onClick={() => runTool('discover')}>
                  <Play className="mr-1 h-3.5 w-3.5" /> Discover
                </Button>
                <Button size="sm" onClick={() => runTool('list-tools')}>
                  List Tools
                </Button>
                <Button size="sm" onClick={() => runTool('call-tool')}>
                  Call device:list
                </Button>
              </div>
              <div className="relative">
                <Terminal className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <div className="mt-6 p-3 bg-slate-950 rounded-md font-mono text-xs text-slate-300 min-h-[120px] max-h-[300px] overflow-auto">
                  {output || '> Ready. Click a tool to execute.'}
                </div>
                {output && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-2 top-2"
                    onClick={() => navigator.clipboard.writeText(output)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
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
      </CardContent>
    </Card>
  );
}

function ServerEntry({ name, tools, status }: { name: string; tools: string[]; status: string }) {
  return (
    <div className="p-3 bg-slate-800/50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">{name}</span>
        <span
          className={`px-2 py-0.5 text-xs rounded-full ${status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}
        >
          {status}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {tools.map(t => (
          <span key={t} className="px-2 py-0.5 text-xs bg-slate-700 rounded">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
