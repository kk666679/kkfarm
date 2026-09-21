import { useState } from 'react';
import { Play, Code, Copy, Download, X } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const DEFAULT_CODE = `// Skill: Device Health Check
// Description: Checks device health and reports status

export default async function skill(device) {
  const health = await device.getHealth();

  if (health.status === 'healthy') {
    return { status: 'pass', message: 'Device is healthy' };
  } else {
    return { status: 'fail', message: 'Device health check failed' };
  }
}`;

const TEMPLATES = [
  { name: 'Health Check', description: 'Basic device health check', icon: '🏥' },
  { name: 'App Install', description: 'Install and verify app', icon: '📱' },
  { name: 'Screenshot', description: 'Capture device screenshot', icon: '📸' },
  { name: 'Performance Test', description: 'Run performance benchmarks', icon: '⚡' },
  { name: 'Network Test', description: 'Test network connectivity', icon: '🌐' },
  { name: 'Security Scan', description: 'Scan for vulnerabilities', icon: '🔒' },
];

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function SkillPlayground() {
  const [activeTab, setActiveTab] = useState('editor');
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Running skill...\n');
    await new Promise(r => setTimeout(r, 1500));
    setOutput(
      'Running skill...\n' +
        '✓ Connected to device\n' +
        '✓ Health check passed\n' +
        '✓ Device status: healthy\n\n' +
        '✓ Skill completed successfully!'
    );
    setIsRunning(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
  };

  return (
    <div className="space-y-6">
      <PageHeader isRunning={isRunning} onCopy={handleCopy} onRun={handleRun} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="console">Console</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
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

        <TabsContent value="docs" className="space-y-4">
          <DocsCard />
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
  onCopy: () => void;
  onRun: () => void;
}

function PageHeader({ isRunning, onCopy, onRun }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Skill Playground</h1>
        <p className="text-muted-foreground">Test and develop skills in a sandbox environment</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCopy}>
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </Button>
        <RunButton isRunning={isRunning} onRun={onRun} label="Run Skill" />
      </div>
    </div>
  );
}

interface RunButtonProps {
  isRunning: boolean;
  onRun: () => void;
  label: string;
}

function RunButton({ isRunning, onRun, label }: RunButtonProps) {
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
          {label}
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
          placeholder="// Write your skill here..."
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
          {output || '> Ready to run skill...\n> Select a skill and click Run'}
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
        <CardTitle>Skill Templates</CardTitle>
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

// ---------------------------------------------------------------------------
// Docs tab
// ---------------------------------------------------------------------------

function DocsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill API Reference</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-6">
          <CodeSection
            title="Device Object"
            code={`interface Device {
  id: string;
  name: string;
  getHealth(): Promise<HealthStatus>;
  executeCommand(cmd: string): Promise<CommandResult>;
  installApp(apkPath: string): Promise<void>;
  takeScreenshot(): Promise<Buffer>;
  getLogs(filter?: LogFilter): Promise<LogEntry[]>;
}`}
          />
          <CodeSection
            title="HealthStatus"
            code={`interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  batteryLevel?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  storageUsage?: number;
  temperature?: number;
  networkLatency?: number;
}`}
          />
          <CodeSection
            title="Skill Return Types"
            code={`type SkillResult =
  | { status: 'pass'; message: string; data?: any }
  | { status: 'fail'; message: string; error?: Error }
  | { status: 'skip'; message: string };  // Optional skip`}
          />
          <GlobalsSection />
        </div>
      </CardContent>
    </Card>
  );
}

interface CodeSectionProps {
  title: string;
  code: string;
}

function CodeSection({ title, code }: CodeSectionProps) {
  return (
    <div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function GlobalsSection() {
  const globals = [
    { name: 'device', description: 'Current device instance' },
    { name: 'logger', description: 'Structured logging' },
    { name: 'config', description: 'Skill configuration' },
    { name: 'storage', description: 'Persistent key-value storage' },
    { name: 'http', description: 'HTTP client for external APIs' },
  ];

  return (
    <div>
      <h4 className="font-semibold mb-2">Available Globals</h4>
      <ul className="space-y-1 text-sm">
        {globals.map(g => (
          <li key={g.name}>
            <code>{g.name}</code> - {g.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
