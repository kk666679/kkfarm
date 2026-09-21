import { useState } from 'react';
import {
  Send,
  Copy,
  Check,
  Play,
  Code,
  Globe,
  Lock,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Terminal,
  Shield,
  Zap,
} from 'lucide-react';

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-slate-700 bg-slate-900 text-white ${className}`}>
      {children}
    </div>
  );
}
function CardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
}
function CardTitle({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
  );
}
function CardContent({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

export default function ApiExplorer() {
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('/api/v1/devices');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['endpoints', 'auth']);

  const toggleSection = (name: string) => {
    setExpandedSections(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const sendRequest = async () => {
    setLoading(true);
    try {
      setResponse(JSON.stringify({ method, path, body: body || '{}', mock: true }, null, 2));
    } catch (err) {
      setResponse(JSON.stringify({ error: (err as Error).message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(response);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">API Explorer</h1>
        <p className="text-slate-400 text-sm mt-1">Test API endpoints interactively</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <select
                value={method}
                onChange={e => setMethod(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>PATCH</option>
                <option>DELETE</option>
              </select>
              <input
                type="text"
                value={path}
                onChange={e => setPath(e.target.value)}
                placeholder="/api/v1/endpoint"
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={sendRequest}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 h-10 px-4"
              >
                <Play className="mr-2 h-4 w-4" />
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Request Body</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder='{"key": "value"}'
                rows={6}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Response</CardTitle>
            <button
              onClick={copyResponse}
              disabled={!response}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-slate-800 h-9 px-3"
            >
              <Copy className="mr-1 h-3.5 w-3.5" />
              Copy
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {response ? (
            <pre className="p-4 bg-slate-950 rounded-md text-sm font-mono text-green-400 overflow-auto max-h-96">
              {response}
            </pre>
          ) : (
            <div className="p-4 bg-slate-950 rounded-md text-sm text-slate-500">
              Send a request to see the response here.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>SDK Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <CodeSnippet label="List Devices" code="client.listDevices()" />
              <CodeSnippet label="Get Device" code="client.getDevice(id)" />
              <CodeSnippet label="List Workflows" code="client.listWorkflows()" />
              <CodeSnippet label="Create Integration" code="client.createIntegration(params)" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Lock className="h-4 w-4 text-green-400" />
                <span>Bearer Token Auth</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-md font-mono text-xs text-slate-300">
                Authorization: Bearer {'<'}api-key{'>'}
              </div>
              <p className="text-xs text-slate-400">
                All requests require a valid API key in the Authorization header.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Base URL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-blue-400" />
                <span>Production</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-md font-mono text-xs text-slate-300">
                https://api.smartdevicecloud.com
              </div>
              <div className="text-xs text-slate-400">WebSocket: wss://ws.smartdevicecloud.com</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CodeSnippet({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between p-2 bg-slate-950 rounded">
      <code className="text-xs font-mono text-blue-300">{code}</code>
      <button
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="inline-flex items-center justify-center rounded-md hover:bg-slate-800 h-7 px-2"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </button>
    </div>
  );
}
