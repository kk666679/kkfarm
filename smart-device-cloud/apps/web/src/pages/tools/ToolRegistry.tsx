import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Wrench,
  Play,
  Database,
  GitBranch,
  Search,
  Filter,
  Plus,
  Settings,
  Code,
  History,
} from 'lucide-react';
import { useState } from 'react';

export default function ToolRegistry() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const tools = [
    {
      id: '1',
      name: 'ADB Enhanced',
      category: 'Device Control',
      version: '3.2.1',
      status: 'Active',
      description: 'Extended ADB commands with retry logic',
      author: 'Core Team',
      lastUsed: '5m ago',
    },
    {
      id: '2',
      name: 'Logcat Parser',
      category: 'Log Analysis',
      version: '2.1.0',
      status: 'Active',
      description: 'Real-time logcat filtering and analysis',
      author: 'Core Team',
      lastUsed: '1h ago',
    },
    {
      id: '3',
      name: 'Screenshot Capture',
      category: 'Media',
      version: '1.5.0',
      status: 'Active',
      description: 'High-quality screenshot capture with annotations',
      author: 'Media Team',
      lastUsed: '30m ago',
    },
    {
      id: '4',
      name: 'Network Interceptor',
      category: 'Network',
      version: '2.0.0',
      status: 'Beta',
      description: 'HTTP/HTTPS traffic interception and modification',
      author: 'Network Team',
      lastUsed: '2h ago',
    },
    {
      id: '5',
      name: 'Performance Profiler',
      category: 'Performance',
      version: '1.2.0',
      status: 'Active',
      description: 'CPU, memory, and battery profiling',
      author: 'Perf Team',
      lastUsed: '4h ago',
    },
    {
      id: '6',
      name: 'App Installer',
      category: 'Deployment',
      version: '3.0.0',
      status: 'Active',
      description: 'Batch app installation with verification',
      author: 'Deploy Team',
      lastUsed: '10m ago',
    },
  ];

  const filteredTools = tools.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || t.category === filter || t.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tool Registry</h1>
          <p className="text-muted-foreground">Manage and execute device tools</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Tool
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="rounded-lg border p-2 bg-background"
        >
          <option value="all">All Categories</option>
          <option value="Device Control">Device Control</option>
          <option value="Log Analysis">Log Analysis</option>
          <option value="Media">Media</option>
          <option value="Network">Network</option>
          <option value="Performance">Performance</option>
          <option value="Deployment">Deployment</option>
          <option value="Active">Active</option>
          <option value="Beta">Beta</option>
        </select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tools</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="beta">Beta</TabsTrigger>
          <TabsTrigger value="mine">My Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-3">
            {tools.map(tool => (
              <Card key={tool.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          tool.category === 'Device Control'
                            ? 'bg-blue-500/10'
                            : tool.category === 'Log Analysis'
                              ? 'bg-green-500/10'
                              : tool.category === 'Media'
                                ? 'bg-purple-500/10'
                                : tool.category === 'Network'
                                  ? 'bg-orange-500/10'
                                  : tool.category === 'Performance'
                                    ? 'bg-amber-500/10'
                                    : tool.category === 'Deployment'
                                      ? 'bg-green-500/10'
                                      : 'bg-gray-500/10'
                        }`}
                      >
                        <Wrench className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{tool.name}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              tool.status === 'Active'
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-amber-500/10 text-amber-500'
                            }`}
                          >
                            {tool.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span>{tool.category}</span>
                          <span>v{tool.version}</span>
                          <span>by {tool.author}</span>
                          <span>Last used: {tool.lastUsed}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Execute">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Configure">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="View Code">
                        <Code className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="History">
                        <History className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <p className="text-center text-muted-foreground py-8">Active tools</p>
        </TabsContent>

        <TabsContent value="beta" className="space-y-4">
          <p className="text-center text-muted-foreground py-8">Beta tools</p>
        </TabsContent>

        <TabsContent value="mine" className="space-y-4">
          <p className="text-center text-muted-foreground py-8">My tools</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
