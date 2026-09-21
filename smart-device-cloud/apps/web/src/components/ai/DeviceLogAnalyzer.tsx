import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface LogEntry {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  source?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface DeviceLogAnalyzerProps {
  deviceId: string;
  logs?: LogEntry[];
  onAnalyze?: (logs: LogEntry[]) => Promise<string>;
}

export function DeviceLogAnalyzer({ logs, onAnalyze }: DeviceLogAnalyzerProps) {
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error'>('all');
  const [search, setSearch] = useState('');

  const filteredLogs = (logs ?? []).filter(log => {
    if (filter !== 'all' && log.level !== filter) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAnalyze = async () => {
    if (!onAnalyze) return;
    setIsAnalyzing(true);
    try {
      const result = await onAnalyze(filteredLogs);
      setAnalysis(result);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const levelConfig = {
    info: { icon: Info, color: 'text-blue-500', label: 'Info' },
    warning: { icon: AlertTriangle, color: 'text-amber-500', label: 'Warning' },
    error: { icon: AlertCircle, color: 'text-red-500', label: 'Error' },
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Log Analyzer</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-2">
            {(['all', 'info', 'warning', 'error'] as const).map(lvl => (
              <Button
                key={lvl}
                variant={filter === lvl ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(lvl)}
              >
                {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
              </Button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          {onAnalyze && (
            <Button onClick={handleAnalyze} disabled={isAnalyzing}>
              {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Analyze
            </Button>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Logs ({filteredLogs.length})</CardTitle>
          </CardHeader>
          <ScrollArea className="h-96">
            <div className="space-y-2 p-4">
              {filteredLogs.length === 0 ? (
                <p className="text-center text-muted-foreground">No logs found</p>
              ) : (
                filteredLogs.map(log => {
                  const cfg = levelConfig[log.level];
                  const Icon = cfg.icon;
                  return (
                    <div key={log.id} className="flex items-start gap-3 rounded-lg border p-3">
                      <Icon className={`mt-0.5 h-4 w-4 ${cfg.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cfg.color}>
                            {cfg.label}
                          </Badge>
                          {log.source && (
                            <span className="text-xs text-muted-foreground">{log.source}</span>
                          )}
                          <span className="ml-auto text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm">{log.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Analysis</CardTitle>
          </CardHeader>
          <ScrollArea className="h-96">
            <div className="p-4">
              {analysis ? (
                <pre className="whitespace-pre-wrap text-sm">{analysis}</pre>
              ) : (
                <p className="text-center text-muted-foreground">
                  Click "Analyze" to get AI insights
                </p>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
