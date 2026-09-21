import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Zap, Brain, Code, Play, Plus, Search, Filter, Download } from 'lucide-react';
import { useState } from 'react';

export default function SkillRegistry() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const skills = [
    {
      id: '1',
      name: 'Device Automation',
      category: 'Automation',
      version: '2.1.0',
      status: 'Published',
      author: 'Team Alpha',
      downloads: 1245,
      rating: 4.8,
      tags: ['android', 'ios', 'automation'],
    },
    {
      id: '2',
      name: 'App Performance Testing',
      category: 'Testing',
      version: '1.5.2',
      status: 'Published',
      author: 'Team Beta',
      downloads: 892,
      rating: 4.6,
      tags: ['performance', 'benchmark', 'android'],
    },
    {
      id: '3',
      name: 'Visual Regression',
      category: 'Testing',
      version: '3.0.1',
      status: 'Beta',
      author: 'Team Gamma',
      downloads: 345,
      rating: 4.9,
      tags: ['visual', 'screenshot', 'comparison'],
    },
    {
      id: '4',
      name: 'Network Monitoring',
      category: 'Monitoring',
      version: '1.8.0',
      status: 'Published',
      author: 'Team Delta',
      downloads: 678,
      rating: 4.5,
      tags: ['network', 'traffic', 'analysis'],
    },
    {
      id: '5',
      name: 'AI Test Generation',
      category: 'AI',
      version: '1.0.0',
      status: 'Alpha',
      author: 'Team Epsilon',
      downloads: 123,
      rating: 4.7,
      tags: ['ai', 'generation', 'testing'],
    },
    {
      id: '6',
      name: 'Security Scanner',
      category: 'Security',
      version: '2.3.1',
      status: 'Published',
      author: 'Team Zeta',
      downloads: 567,
      rating: 4.8,
      tags: ['security', 'vulnerability', 'scan'],
    },
  ];

  const filteredSkills = skills.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || s.category === filter || s.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skill Registry</h1>
          <p className="text-muted-foreground">Discover and manage automation skills</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Skill
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search skills..."
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
          <option value="Automation">Automation</option>
          <option value="Testing">Testing</option>
          <option value="Monitoring">Monitoring</option>
          <option value="AI">AI</option>
          <option value="Security">Security</option>
          <option value="Published">Published</option>
          <option value="Beta">Beta</option>
          <option value="Alpha">Alpha</option>
        </select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Skills</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="beta">Beta</TabsTrigger>
          <TabsTrigger value="alpha">Alpha</TabsTrigger>
          <TabsTrigger value="mine">My Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSkills.map(skill => (
              <Card key={skill.id} className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          skill.category === 'Automation'
                            ? 'bg-blue-500/10'
                            : skill.category === 'Testing'
                              ? 'bg-green-500/10'
                              : skill.category === 'Monitoring'
                                ? 'bg-purple-500/10'
                                : skill.category === 'AI'
                                  ? 'bg-amber-500/10'
                                  : skill.category === 'Security'
                                    ? 'bg-red-500/10'
                                    : 'bg-gray-500/10'
                        }`}
                      >
                        {skill.category === 'Automation' && (
                          <Zap className="h-5 w-5 text-blue-500" />
                        )}
                        {skill.category === 'Testing' && (
                          <Play className="h-5 w-5 text-green-500" />
                        )}
                        {skill.category === 'Monitoring' && (
                          <Brain className="h-5 w-5 text-purple-500" />
                        )}
                        {skill.category === 'AI' && <Sparkles className="h-5 w-5 text-amber-500" />}
                        {skill.category === 'Security' && <Code className="h-5 w-5 text-red-500" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{skill.name}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              skill.status === 'Published'
                                ? 'bg-green-500/10 text-green-500'
                                : skill.status === 'Beta'
                                  ? 'bg-amber-500/10 text-amber-500'
                                  : 'bg-blue-500/10 text-blue-500'
                            }`}
                          >
                            {skill.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.553.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {skill.category} • v{skill.version}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {skill.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 bg-muted rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>By {skill.author}</span>
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {skill.downloads.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        {skill.rating}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Install
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="published" className="space-y-4">
          <p className="text-center text-muted-foreground py-8">Published skills</p>
        </TabsContent>

        <TabsContent value="beta" className="space-y-4">
          <p className="text-center text-muted-foreground py-8">Beta skills</p>
        </TabsContent>

        <TabsContent value="alpha" className="space-y-4">
          <p className="text-center text-muted-foreground py-8">Alpha skills</p>
        </TabsContent>

        <TabsContent value="mine" className="space-y-4">
          <p className="text-center text-muted-foreground py-8">Your skills</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
