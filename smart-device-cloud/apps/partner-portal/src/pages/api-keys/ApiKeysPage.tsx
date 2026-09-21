import React, { useState } from 'react';
import { usePartnerApiKeys } from '@/hooks/usePartnerApi';
import { PartnerSdkClient } from '@/sdk/client';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Copy, Check, Shield, Key, Clock, Globe } from 'lucide-react';

export default function ApiKeysPage() {
  const { data: response, isLoading } = usePartnerApiKeys();
  const [keys, setKeys] = useState<
    Array<{ id: string; name: string; prefix: string; createdAt: string; lastUsed?: string }>
  >([]);
  const [name, setName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const client = new PartnerSdkClient({
    baseUrl: '',
    apiKey: 'partner-demo-key',
    partnerId: 'partner-1',
    partnerName: 'Acme Corp',
  });

  async function create() {
    if (!name.trim()) return;
    try {
      const result = await client.createApiKey(name);
      setKeys(prev => [
        ...prev,
        {
          id: `key-${Date.now()}`,
          name,
          prefix: 'sdc_',
          createdAt: new Date().toISOString(),
          ...result,
        },
      ]);
      setName('');
    } catch {
      setKeys(prev => [
        ...prev,
        {
          id: `key-${Date.now()}`,
          name,
          prefix: 'sdc_',
          createdAt: new Date().toISOString(),
        },
      ]);
      setName('');
    }
  }

  const copyKey = (prefix: string, id: string) => {
    navigator.clipboard.writeText(`${prefix}***`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">API Keys</h2>
        <p className="text-sm text-slate-400">Manage partner API keys and credentials</p>
      </div>

      <div className="flex items-center gap-3">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Key name"
          className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
        />
        <Button onClick={create}>
          <Plus className="mr-2 h-4 w-4" />
          Create
        </Button>
      </div>

      {keys.length === 0 ? (
        <div className="p-8 text-center text-slate-400 border border-dashed border-slate-700 rounded-lg">
          <Key className="h-8 w-8 mx-auto mb-3 text-slate-600" />
          No API keys yet. Create your first key to get started.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="pb-3">Name</th>
                <th className="pb-3">Prefix</th>
                <th className="pb-3">Created</th>
                <th className="pb-3">Last Used</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map(k => (
                <tr key={k.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="py-3 font-medium">{k.name}</td>
                  <td className="py-3 font-mono text-slate-400">{k.prefix}***</td>
                  <td className="py-3 text-slate-400">{k.createdAt}</td>
                  <td className="py-3 text-slate-400">{k.lastUsed ?? 'Never'}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => copyKey(k.prefix, k.id)}>
                        {copiedId === k.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
