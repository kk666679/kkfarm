import { useState } from 'react';
import { Play, Code, Download, X } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const DEFAULT_CODE = `// Tool: Device Info Collector
// Description: Collects comprehensive device information

export default async function tool(device, params = {}) {
  const info = await device.getInfo();
  const health = await device.getHealth();
  const apps = await device.getInstalledApps();

  return {
    device: {
      id: info.id,
      name: info.name,
      model: info.model,
      manufacturer: info.manufacturer,
      androidVersion: info.androidVersion,
      apiLevel: info.apiLevel,
    },
    health: {
      status: health.status,
      battery: health.batteryLevel,
      cpu: health.cpuUsage,
      memory: health.memoryUsage,
      storage: health.storageUsage,
    },
    apps: apps.map(app => ({
      packageName: app.packageName,
      version: app.versionName,
      installed: app.installedAt,
    })),
    timestamp: new Date().toISOString(),
  };
}`;

const TEMPLATES = [
  { name: 'Device Info', description: 'Collect device information', icon: '📋' },
  { name: 'Log Collector', description: 'Collect and filter logs', icon: '📜' },
  { name: 'Screenshot Tool', description: 'Capture screenshots', icon: '📸' },
  { name: 'Performance Profiler', description: 'Profile CPU/Memory', icon: '⚡' },
  { name: 'Network Sniffer', description: 'Capture network traffic', icon: '🔍' },
  { name: 'Battery Monitor', description: 'Monitor battery health', icon: '🔋' },
];

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ToolPlayground() {
  const [activeTab, setActiveTab] = useState('editor');
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Executing tool...\n');
    await new Promise(r => setTimeout(r, 1000));
    setOutput(
      'Executing tool...\n' +
        '✓ Connected to device\n' +
        '✓ Device info collected\n' +
        '✓ Health data retrieved\n' +
        '✓ App list retrieved (47 apps)\n\n' +
        '✓ Tool completed successfully!\n\n' +
        'Output saved to: /tools/output/device-info-2024-01-15.json'
    );
    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader isRunning={isRunning} onClear={() => setOutput('')} onRun={handleRun} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="console">Console</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <EditorCard code={code} onChange={setCode} />
        </TabsContent>

        <TabsContent value="console" className="space-y-4">
          <ConsoleCard output={output} onClear={() => setOutput('')} />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <TemplatesCard templates={TEMPLATES} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Execution History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Execution history coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

interface PageHeaderProps {
  isRunning: boolean;
  onClear: () => void;
  onRun: () => void;
}

function PageHeader({ isRunning, onClear, onRun }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tool Playground</h1>
        <p className="text-muted-foreground">Test and develop tools in a sandbox environment</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onClear}>
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
        <RunButton isRunning={isRunning} onRun={onRun} />
      </div>
    </div>
  );
}

interface RunButtonProps {
  isRunning: boolean;
  onRun: () => void;
}

function RunButton({ isRunning, onRun }: RunButtonProps) {
  return (
    <Button onClick={onRun} disabled={isRunning}>
      {isRunning ? (
        <>
          <Spinner />
          Running...
        </>
      ) : (
        <>
          <Play className="h-4 w-4 mr-2" />
          Run Tool
        </>
      )}
    </Button>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 mr-2 animate-spin" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Editor tab
// ---------------------------------------------------------------------------

interface EditorCardProps {
  code: string;
  onChange: (value: string) => void;
}

function EditorCard({ code, onChange }: EditorCardProps) {
  return (
    <Card className="flex flex-col h-[calc(100vh-20rem)]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Code Editor</CardTitle>
          <div className="flex items-center gap-2">
            <select className="rounded-lg border p-1 text-sm">
              <option>JavaScript</option>
              <option>TypeScript</option>
              <option>Python</option>
              <option>Shell</option>
            </select>
            <Button variant="outline" size="sm">
              <Code className="h-4 w-4 mr-2" />
              Format
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <textarea
          value={code}
          onChange={e => onChange(e.target.value)}
          className="w-full h-full font-mono text-sm p-4 bg-background border-0 resize-none focus:outline-none"
          placeholder="// Write your tool here..."
          spellCheck={false}
        />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Console tab
// ---------------------------------------------------------------------------

interface ConsoleCardProps {
  output: string;
  onClear: () => void;
}

function ConsoleCard({ output, onClear }: ConsoleCardProps) {
  return (
    <Card className="flex flex-col h-[calc(100vh-20rem)]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Console Output</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClear}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <pre className="w-full h-full p-4 bg-background text-sm font-mono text-green-500 overflow-auto">
          {output || '> Ready to execute tool...\n> Write your tool code and click Run'}
        </pre>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Templates tab
// ---------------------------------------------------------------------------

interface Template {
  name: string;
  description: string;
  icon: string;
}

interface TemplatesCardProps {
  templates: Template[];
}

function TemplatesCard({ templates }: TemplatesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tool Templates</CardTitle>
        <CardDescription>Start with a pre-built template</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map(template => (
            <TemplateCard key={template.name} template={template} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TemplateCard({ template }: { template: Template }) {
  return (
    <Card className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{template.icon}</span>
        <div>
          <h4 className="font-medium">{template.name}</h4>
          <p className="text-sm text-muted-foreground">{template.description}</p>
        </div>
      </div>
    </Card>
  );
}
