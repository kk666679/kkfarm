import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, BarChart3, Search, Filter, Plus, Code, Play, Download } from 'lucide-react';
import { useState } from 'react';

export default function EvalLeaderboard() {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const models = [
    {
      rank: 1,
      name: 'GPT-4 Turbo',
      provider: 'OpenAI',
      score: 94.2,
      tests: 1247,
      latency: '1.2s',
      cost: '$0.01/1k',
      status: 'Active',
    },
    {
      rank: 2,
      name: 'Claude 3 Opus',
      provider: 'Anthropic',
      score: 93.8,
      tests: 1189,
      latency: '1.5s',
      cost: '$0.015/1k',
      status: 'Active',
    },
    {
      rank: 3,
      name: 'Gemini 1.5 Pro',
      provider: 'Google',
      score: 92.5,
      tests: 1156,
      latency: '1.8s',
      cost: '$0.007/1k',
      status: 'Active',
    },
    {
      rank: 4,
      name: 'GPT-4',
      provider: 'OpenAI',
      score: 91.7,
      tests: 1102,
      latency: '2.1s',
      cost: '$0.03/1k',
      status: 'Active',
    },
    {
      rank: 5,
      name: 'Claude 3 Sonnet',
      provider: 'Anthropic',
      score: 89.3,
      tests: 987,
      latency: '1.3s',
      cost: '$0.003/1k',
      status: 'Active',
    },
    {
      rank: 6,
      name: 'Llama 3 70B',
      provider: 'Meta',
      score: 87.9,
      tests: 856,
      latency: '2.5s',
      cost: '$0.001/1k',
      status: 'Active',
    },
    {
      rank: 7,
      name: 'Mistral Large',
      provider: 'Mistral',
      score: 86.4,
      tests: 743,
      latency: '1.8s',
      cost: '$0.008/1k',
      status: 'Beta',
    },
    {
      rank: 8,
      name: 'Command R+',
      provider: 'Cohere',
      score: 84.7,
      tests: 621,
      latency: '1.6s',
      cost: '$0.005/1k',
      status: 'Beta',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Eval Leaderboard</h1>
          <p className="text-muted-foreground">Model performance rankings and comparisons</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Evaluation
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="runs">Runs</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
          <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-2 pr-4 text-left font-medium">#</th>
                  <th className="pb-2 pr-4 text-left font-medium">Model</th>
                  <th className="pb-2 pr-4 text-left font-medium">Provider</th>
                  <th className="pb-2 pr-4 text-center font-medium">Score</th>
                  <th className="pb-2 pr-4 text-center font-medium">Tests</th>
                  <th className="pb-2 pr-4 text-center font-medium">Latency</th>
                  <th className="pb-2 pr-4 text-center font-medium">Cost/1k</th>
                  <th className="pb-2 pr-4 text-center font-medium">Status</th>
                  <th className="pb-2 pr-4 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {models.map(model => (
                  <tr key={model.rank} className="border-t">
                    <td className="py-3 pr-4 font-bold text-lg">{model.rank}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-muted">
                          {model.provider}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-muted-foreground">{model.provider}</td>
                    <td className="py-3 pr-4 text-center font-bold text-lg">{model.score}</td>
                    <td className="py-3 pr-4 text-center text-sm">
                      {model.tests.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-center text-sm">{model.latency}</td>
                    <td className="py-3 pr-4 text-center text-sm font-mono">{model.cost}</td>
                    <td className="py-3 pr-4 text-center">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          model.status === 'Active'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {model.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Run">
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="View Details"
                        >
                          <Code className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="runs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Evaluation Runs</CardTitle>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Run
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Evaluation runs history coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compare" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Comparison</CardTitle>
              <CardDescription>Compare models side by side</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Model comparison tool coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fixtures" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Test Fixtures</CardTitle>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Fixture
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Test fixture management coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
