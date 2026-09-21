import { useState } from 'react';
import {
  Server,
  Database,
  Code,
  Activity,
  Search,
  Plus,
  Settings,
  Wrench,
  RefreshCw,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MCPServerInfo {
  id: string;
  name: string;
  url: string;
  status: 'Connected' | 'Disconnected';
  version: string;
  tools: number;
  resources: number;
  uptime: string;
  lastSync: string;
}

interface MCPToolInfo {
  name: string;
  server: string;
  description: string;
  params: string;
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const SERVERS: MCPServerInfo[] = [
  {
    id: '1',
    name: 'Production MCP',
    url: 'mcp.prod.company.com',
    status: 'Connected',
    version: '2.1.0',
    tools: 45,
    resources: 12,
    uptime: '99.9%',
    lastSync: '2m ago',
  },
  {
    id: '2',
    name: 'Staging MCP',
    url: 'mcp.staging.company.com',
    status: 'Connected',
    version: '2.1.0',
    tools: 42,
    resources: 10,
    uptime: '99.8%',
    lastSync: '1m ago',
  },
  {
    id: '3',
    name: 'Development MCP',
    url: 'mcp.dev.company.com',
    status: 'Connected',
    version: '2.2.0-rc',
    tools: 48,
    resources: 15,
    uptime: '99.5%',
    lastSync: '30s ago',
  },
  {
    id: '4',
    name: 'Analytics MCP',
    url: 'mcp.analytics.company.com',
    status: 'Disconnected',
    version: '1.5.0',
    tools: 12,
    resources: 3,
    uptime: '0%',
    lastSync: '2h ago',
  },
];

const TOOLS: MCPToolInfo[] = [
  {
    name: 'list_devices',
    server: 'Production MCP',
    description: 'List all registered devices',
    params: 'filter?, limit?, offset?',
  },
  {
    name: 'get_device',
    server: 'Production MCP',
    description: 'Get device details by ID',
    params: 'deviceId (required)',
  },
  {
    name: 'execute_command',
    server: 'Production MCP',
    description: 'Execute shell command on device',
    params: 'deviceId, command, timeout?',
  },
  {
    name: 'install_app',
    server: 'Production MCP',
    description: 'Install APK on device',
    params: 'deviceId, apkUrl, options?',
  },
  {
    name: 'take_screenshot',
    server: 'Staging MCP',
    description: 'Capture device screenshot',
    params: 'deviceId, quality?',
  },
  {
    name: 'get_logs',
    server: 'Development MCP',
    description: 'Retrieve device logs',
    params: 'deviceId, filter?, lines?',
  },
];

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function MCPServers() {
  const [activeTab, setActiveTab] = useState('servers');

  return (
    <div className="space-y-6">
      <PageHeader />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="servers">Servers</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="extensions">Extensions</TabsTrigger>
        </TabsList>

        <TabsContent value="servers" className="space-y-4">
          <ServerList servers={SERVERS} />
          <AddServerCard />
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <ToolsCard tools={TOOLS} />
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <EmptyCard title="Available Resources" message="Resource browser coming soon" />
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          <DiscoverCard />
        </TabsContent>

        <TabsContent value="extensions" className="space-y-4">
          <EmptyCard
            title="MCP Extensions"
            description="Manage server extensions and plugins"
            message="Extension management coming soon"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page header
// ---------------------------------------------------------------------------

function PageHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">MCP Servers</h1>
        <p className="text-muted-foreground">Manage Model Context Protocol servers</p>
      </div>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Add Server
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Server list
// ---------------------------------------------------------------------------

interface ServerListProps {
  servers: MCPServerInfo[];
}

function ServerList({ servers }: ServerListProps) {
  return (
    <div className="space-y-4">
      {servers.map(server => (
        <ServerRow key={server.id} server={server} />
      ))}
    </div>
  );
}

interface ServerRowProps {
  server: MCPServerInfo;
}

function ServerRow({ server }: ServerRowProps) {
  const connected = server.status === 'Connected';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <ServerIdentity server={server} connected={connected} />
          <ServerActions />
        </div>
      </CardContent>
    </Card>
  );
}

interface ServerIdentityProps {
  server: MCPServerInfo;
  connected: boolean;
}

function ServerIdentity({ server, connected }: ServerIdentityProps) {
  return (
    <div className="flex items-center gap-4 flex-1 min-w-0">
      <ServerIcon connected={connected} />
      <div className="min-w-0">
        <ServerTitle name={server.name} connected={connected} />
        <p className="text-sm text-muted-foreground truncate">{server.url}</p>
        <ServerMeta server={server} />
      </div>
    </div>
  );
}

function ServerIcon({ connected }: { connected: boolean }) {
  return (
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
        connected ? 'bg-green-500/10' : 'bg-red-500/10'
      }`}
    >
      <Server className={`h-6 w-6 ${connected ? 'text-green-500' : 'text-red-500'}`} />
    </div>
  );
}

interface ServerTitleProps {
  name: string;
  connected: boolean;
}

function ServerTitle({ name, connected }: ServerTitleProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">{name}</span>
      <span
        className={`text-xs px-2 py-0.5 rounded ${
          connected ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
        }`}
      >
        {connected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
}

function ServerMeta({ server }: { server: MCPServerInfo }) {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
      <span className="flex items-center gap-1">
        <Code className="h-3 w-3" />v{server.version}
      </span>
      <span className="flex items-center gap-1">
        <Wrench className="h-3 w-3" />
        {server.tools} tools
      </span>
      <span className="flex items-center gap-1">
        <Database className="h-3 w-3" />
        {server.resources} resources
      </span>
      <span className="flex items-center gap-1">
        <Activity className="h-3 w-3" />
        {server.uptime} uptime
      </span>
      <span>Synced {server.lastSync}</span>
    </div>
  );
}

function ServerActions() {
  return (
    <div className="flex items-center gap-2">
      <IconButton title="Sync" icon={RefreshCw} />
      <IconButton title="Configure" icon={Settings} />
      <IconButton title="View Tools" icon={Wrench} />
      <IconButton title="View Resources" icon={Database} />
    </div>
  );
}

interface IconButtonProps {
  title: string;
  icon: typeof RefreshCw;
}

function IconButton({ title, icon: Icon }: IconButtonProps) {
  return (
    <Button variant="ghost" size="icon" className="h-7 w-7" title={title}>
      <Icon className="h-4 w-4" />
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Add server form
// ---------------------------------------------------------------------------

function AddServerCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Add MCP Server</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4 max-w-2xl">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="serverName">Server Name</Label>
              <Input id="serverName" placeholder="Production MCP" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serverUrl">Server URL</Label>
              <Input id="serverUrl" placeholder="mcp.example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="serverToken">Auth Token</Label>
            <Input id="serverToken" type="password" placeholder="Bearer token or API key" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="autoSync" defaultChecked className="rounded border-input" />
            <Label htmlFor="autoSync" className="font-normal cursor-pointer">
              Auto-sync tools and resources
            </Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Server
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Tools tab
// ---------------------------------------------------------------------------

interface ToolsCardProps {
  tools: MCPToolInfo[];
}

function ToolsCard({ tools }: ToolsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Available Tools</CardTitle>
        <ToolFilters />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tools.map(tool => (
            <ToolRow key={tool.name} tool={tool} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ToolFilters() {
  return (
    <div className="flex gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search tools..." className="pl-9 w-64" />
      </div>
      <select className="rounded-lg border p-2 bg-background">
        <option>All Servers</option>
        <option>Production MCP</option>
        <option>Staging MCP</option>
        <option>Development MCP</option>
      </select>
    </div>
  );
}

function ToolRow({ tool }: { tool: MCPToolInfo }) {
  return (
    <div className="p-4 border rounded-lg bg-muted/30 flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono font-medium text-sm">{tool.name}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-muted">{tool.server}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
        <p className="text-xs text-muted-foreground font-mono mt-1">Params: {tool.params}</p>
      </div>
      <Button variant="ghost" size="sm">
        Test
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Discover tab
// ---------------------------------------------------------------------------

function DiscoverCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Discover MCP Servers</CardTitle>
        <CardDescription>Scan network for available MCP servers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Scan Network
          </Button>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Manual Add
          </Button>
        </div>
        <p className="text-muted-foreground">Network discovery coming soon</p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Reusable empty-state card
// ---------------------------------------------------------------------------

interface EmptyCardProps {
  title: string;
  description?: string;
  message: string;
}

function EmptyCard({ title, description, message }: EmptyCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
