import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageTitle } from '@/components/common/PageTitle';
import { PartnerSdkClient } from '@/sdk/client';
import {
  BookOpen,
  Code,
  FileText,
  Terminal,
  Globe,
  Zap,
  Layers,
  Shield,
  Play,
  ChevronRight,
} from 'lucide-react';

export default function DocumentationPage() {
  const client = new PartnerSdkClient({
    baseUrl: '',
    apiKey: 'partner-demo-key',
    partnerId: 'partner-1',
    partnerName: 'Acme Corp',
  });

  return (
    <div className="space-y-6">
      <PageTitle title="Documentation" subtitle="API reference and integration guides" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DocCard
          icon={Code}
          title="REST API Reference"
          description="Complete API reference with endpoints, request/response examples, and error codes."
          href="/docs/rest"
        />
        <DocCard
          icon={Terminal}
          title="MCP Integration Guide"
          description="Set up Model Context Protocol servers and tools for device management."
          href="/docs/mcp"
        />
        <DocCard
          icon={Zap}
          title="SDK Quickstart"
          description="Get started with the partner SDK in minutes. Install, configure, and make your first call."
          href="/docs/sdk"
        />
        <DocCard
          icon={Globe}
          title="Webhook Events"
          description="Configure webhooks and subscribe to real-time events."
          href="/docs/webhooks"
        />
        <DocCard
          icon={BookOpen}
          title="Authentication"
          description="Learn about Bearer token auth, API key management, and permissions."
          href="/docs/auth"
        />
        <DocCard
          icon={Layers}
          title="Rate Limits"
          description="Understand rate limiting policies and how to handle 429 responses."
          href="/docs/limits"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SDK Example</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="p-4 bg-slate-950 rounded-md text-sm font-mono text-slate-300 overflow-auto">
              {`import { PartnerSdkClient } from '@sdc/partner';

const client = new PartnerSdkClient({
  baseUrl: 'https://api.smartdevicecloud.com',
  apiKey: 'your-api-key',
  partnerId: 'partner-1',
});

// List devices
const devices = await client.getPartnerDevices();

// Check usage
const usage = await client.getPartnerUsage();

// Create webhook
const webhook = await client.createWebhook({
  url: 'https://your-app.com/webhook',
  events: ['device.online', 'workload.completed'],
});`}
            </pre>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2"
              onClick={() =>
                navigator.clipboard.writeText(`import { PartnerSdkClient } from '@sdc/partner';

const client = new PartnerSdkClient({
  baseUrl: 'https://api.smartdevicecloud.com',
  apiKey: 'your-api-key',
  partnerId: 'partner-1',
});

const devices = await client.getPartnerDevices();
const usage = await client.getPartnerUsage();`)
              }
            >
              <FileText className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DocCard({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: any;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Card className="hover:border-blue-500/30 transition-colors">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-blue-400" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-400 mb-4">{description}</p>
        <a
          href={href}
          className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300"
        >
          Read more <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </a>
      </CardContent>
    </Card>
  );
}
