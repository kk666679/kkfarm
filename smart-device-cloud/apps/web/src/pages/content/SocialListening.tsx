import { useState } from 'react';
import {
  Radio,
  TrendingUp,
  Users,
  Filter,
  Music2,
  Camera,
  Video,
  Briefcase,
  AtSign,
  Globe,
  ShoppingBag,
  ShoppingCart,
  Workflow,
  Bot,
  Download,
  type LucideIcon,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PlatformId =
  | 'tiktok'
  | 'instagram'
  | 'youtube'
  | 'linkedin'
  | 'threads'
  | 'facebook'
  | 'shopee'
  | 'shopify'
  | 'n8n'
  | 'zeppy';

type Sentiment = 'positive' | 'neutral' | 'negative';

interface PlatformMeta {
  id: PlatformId;
  name: string;
  icon: LucideIcon;
  color: string;
  category: 'social' | 'professional' | 'ecommerce' | 'automation';
}

interface PlatformStats {
  platform: PlatformId;
  mentions: number;
  changePercent: number;
  positive: number;
  neutral: number;
  negative: number;
  engagement: number;
}

interface Mention {
  id: string;
  platform: PlatformId;
  author: string;
  content: string;
  sentiment: Sentiment;
  time: string;
  reach?: number;
  url?: string;
}

// ---------------------------------------------------------------------------
// Platform catalog — all 10 platforms
// ---------------------------------------------------------------------------

const PLATFORMS: PlatformMeta[] = [
  { id: 'tiktok', name: 'TikTok', icon: Music2, color: 'text-pink-500', category: 'social' },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Camera,
    color: 'text-fuchsia-500',
    category: 'social',
  },
  { id: 'youtube', name: 'YouTube', icon: Video, color: 'text-red-500', category: 'social' },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Briefcase,
    color: 'text-blue-500',
    category: 'professional',
  },
  { id: 'facebook', name: 'Facebook', icon: Globe, color: 'text-blue-600', category: 'social' },
  {
    id: 'shopee',
    name: 'Shopee',
    icon: ShoppingBag,
    color: 'text-orange-500',
    category: 'ecommerce',
  },
  {
    id: 'shopify',
    name: 'Shopify',
    icon: ShoppingCart,
    color: 'text-green-600',
    category: 'ecommerce',
  },
  { id: 'n8n', name: 'n8n', icon: Workflow, color: 'text-indigo-500', category: 'automation' },
  { id: 'zeppy', name: 'Zeppy', icon: Bot, color: 'text-violet-500', category: 'automation' },
];

const PLATFORM_MAP: Record<PlatformId, PlatformMeta> = Object.fromEntries(
  PLATFORMS.map(p => [p.id, p])
) as Record<PlatformId, PlatformMeta>;

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const OVERVIEW_STATS = {
  totalMentions: 12453,
  totalChange: +12,
  positivePercent: 78,
  positiveChange: +5,
  engagementRate: 4.2,
  engagementChange: -1.2,
  shareOfVoice: 34,
  shareChange: +3,
};

const PLATFORM_STATS: PlatformStats[] = [
  {
    platform: 'tiktok',
    mentions: 3820,
    changePercent: +24,
    positive: 82,
    neutral: 12,
    negative: 6,
    engagement: 6.8,
  },
  {
    platform: 'instagram',
    mentions: 2410,
    changePercent: +15,
    positive: 79,
    neutral: 14,
    negative: 7,
    engagement: 5.2,
  },
  {
    platform: 'youtube',
    mentions: 1890,
    changePercent: +8,
    positive: 81,
    neutral: 13,
    negative: 6,
    engagement: 4.1,
  },
  {
    platform: 'linkedin',
    mentions: 1120,
    changePercent: +18,
    positive: 88,
    neutral: 9,
    negative: 3,
    engagement: 3.4,
  },
  {
    platform: 'threads',
    mentions: 980,
    changePercent: +42,
    positive: 74,
    neutral: 18,
    negative: 8,
    engagement: 4.6,
  },
  {
    platform: 'facebook',
    mentions: 890,
    changePercent: -3,
    positive: 71,
    neutral: 19,
    negative: 10,
    engagement: 2.9,
  },
  {
    platform: 'shopee',
    mentions: 620,
    changePercent: +11,
    positive: 76,
    neutral: 15,
    negative: 9,
    engagement: 3.8,
  },
  {
    platform: 'shopify',
    mentions: 410,
    changePercent: +7,
    positive: 84,
    neutral: 11,
    negative: 5,
    engagement: 3.1,
  },
  {
    platform: 'n8n',
    mentions: 210,
    changePercent: +28,
    positive: 91,
    neutral: 7,
    negative: 2,
    engagement: 5.4,
  },
  {
    platform: 'zeppy',
    mentions: 103,
    changePercent: +55,
    positive: 89,
    neutral: 8,
    negative: 3,
    engagement: 4.9,
  },
];

const WEEKLY_VOLUME = [
  { day: 'Mon', value: 45 },
  { day: 'Tue', value: 52 },
  { day: 'Wed', value: 38 },
  { day: 'Thu', value: 60 },
  { day: 'Fri', value: 55 },
  { day: 'Sat', value: 70 },
  { day: 'Sun', value: 65 },
];

const TOP_KEYWORDS = [
  { keyword: 'device farm', score: 85 },
  { keyword: 'android testing', score: 72 },
  { keyword: 'automation', score: 65 },
  { keyword: 'CI/CD', score: 58 },
  { keyword: 'mobile testing', score: 45 },
];

const MENTIONS: Mention[] = [
  {
    id: 'm1',
    platform: 'tiktok',
    author: '@techreviewer',
    content: 'Just tested the new device farm features — impressive automation capabilities! 🔥',
    sentiment: 'positive',
    time: '2h ago',
    reach: 125000,
  },
  {
    id: 'm2',
    platform: 'linkedin',
    author: 'Sarah Chen',
    content: 'Our QA team reduced testing time by 60% using the new automation workflows.',
    sentiment: 'positive',
    time: '4h ago',
    reach: 8400,
  },
  {
    id: 'm3',
    platform: 'threads',
    author: '@dev_ops_daily',
    content: 'Threads is surprisingly good for developer discussions. Anyone else migrating?',
    sentiment: 'neutral',
    time: '5h ago',
    reach: 2100,
  },
  {
    id: 'm4',
    platform: 'facebook',
    author: 'Mobiledev Group',
    content: 'Anyone else having issues with the new API endpoints? Getting 401s on refresh.',
    sentiment: 'negative',
    time: '6h ago',
    reach: 3400,
  },
  {
    id: 'm5',
    platform: 'instagram',
    author: '@devops.daily',
    content: 'Behind the scenes at the new automation lab 📸 #devops #testing',
    sentiment: 'positive',
    time: '7h ago',
    reach: 42000,
  },
  {
    id: 'm6',
    platform: 'youtube',
    author: 'CodeWithKai',
    content: 'Full walkthrough: setting up an Android device farm in 20 minutes.',
    sentiment: 'positive',
    time: '8h ago',
    reach: 67000,
  },
  {
    id: 'm7',
    platform: 'shopee',
    author: 'Seller Review',
    content: 'Fast shipping but the packaging could be improved. 4/5 stars.',
    sentiment: 'neutral',
    time: '10h ago',
    reach: 890,
  },
  {
    id: 'm8',
    platform: 'n8n',
    author: 'community.forum',
    content: 'New workflow template for device provisioning — works perfectly.',
    sentiment: 'positive',
    time: '12h ago',
    reach: 1200,
  },
  {
    id: 'm9',
    platform: 'shopify',
    author: 'Store Owner AMA',
    content: 'Integration with our fulfillment partner is now live. Zero downtime migration.',
    sentiment: 'positive',
    time: '14h ago',
    reach: 5100,
  },
  {
    id: 'm10',
    platform: 'zeppy',
    author: 'automation-news',
    content: 'Zeppy 2.0 launch thread — worth the read if you run self-hosted workflows.',
    sentiment: 'positive',
    time: '18h ago',
    reach: 780,
  },
];

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function SocialListening() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <PageHeader />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="mentions">Mentions</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <KpiStrip />
          <div className="grid gap-4 md:grid-cols-2">
            <VolumeChart />
            <KeywordsPanel />
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <PlatformBreakdown />
        </TabsContent>

        <TabsContent value="mentions" className="space-y-4">
          <MentionsPanel mentions={MENTIONS} />
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <SentimentPanel />
        </TabsContent>

        <TabsContent value="competitors" className="space-y-4">
          <EmptyCard title="Competitor Analysis" message="Competitor tracking coming soon" />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ReportsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function PageHeader() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Social Listening</h1>
      <p className="text-muted-foreground">
        Monitor social, e-commerce, and automation platforms across 10 channels
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KPI strip
// ---------------------------------------------------------------------------

function KpiStrip() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        icon={Radio}
        label="Total Mentions"
        value={OVERVIEW_STATS.totalMentions.toLocaleString()}
        change={OVERVIEW_STATS.totalChange}
        iconBg="bg-primary/10"
        iconColor="text-primary"
      />
      <KpiCard
        icon={TrendingUp}
        label="Positive Sentiment"
        value={`${OVERVIEW_STATS.positivePercent}%`}
        change={OVERVIEW_STATS.positiveChange}
        iconBg="bg-green-500/10"
        iconColor="text-green-500"
      />
      <KpiCard
        icon={Users}
        label="Engagement Rate"
        value={`${OVERVIEW_STATS.engagementRate}%`}
        change={OVERVIEW_STATS.engagementChange}
        iconBg="bg-amber-500/10"
        iconColor="text-amber-500"
      />
      <KpiCard
        icon={Filter}
        label="Share of Voice"
        value={`${OVERVIEW_STATS.shareOfVoice}%`}
        change={OVERVIEW_STATS.shareChange}
        iconBg="bg-blue-500/10"
        iconColor="text-blue-500"
      />
    </div>
  );
}

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change: number;
  iconBg: string;
  iconColor: string;
}

function KpiCard({ icon: Icon, label, value, change, iconBg, iconColor }: KpiCardProps) {
  const changePositive = change >= 0;
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`rounded-lg p-2 ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
          <p className={`text-xs ${changePositive ? 'text-green-500' : 'text-red-500'}`}>
            {changePositive ? '+' : ''}
            {change}% from last week
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Overview: volume chart + keywords
// ---------------------------------------------------------------------------

function VolumeChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mention Volume (7 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-around gap-2">
          {WEEKLY_VOLUME.map(({ day, value }) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                style={{ height: `${value}%` }}
              />
              <span className="text-xs text-muted-foreground">{day}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function KeywordsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Keywords</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {TOP_KEYWORDS.map(({ keyword, score }) => (
            <KeywordRow key={keyword} keyword={keyword} score={score} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface KeywordRowProps {
  keyword: string;
  score: number;
}

function KeywordRow({ keyword, score }: KeywordRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-medium">#{keyword}</span>
      <div className="flex items-center gap-2">
        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: `${score}%` }} />
        </div>
        <span className="text-sm text-muted-foreground w-10 text-right">{score}%</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Platform breakdown
// ---------------------------------------------------------------------------

function PlatformBreakdown() {
  return (
    <div className="space-y-4">
      <PlatformCategorySection title="Social" category="social" />
      <PlatformCategorySection title="Professional" category="professional" />
      <PlatformCategorySection title="E-commerce" category="ecommerce" />
      <PlatformCategorySection title="Automation" category="automation" />
    </div>
  );
}

interface PlatformCategorySectionProps {
  title: string;
  category: PlatformMeta['category'];
}

function PlatformCategorySection({ title, category }: PlatformCategorySectionProps) {
  const rows = PLATFORM_STATS.filter(s => PLATFORM_MAP[s.platform].category === category);
  if (rows.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map(row => (
          <PlatformRow key={row.platform} stats={row} />
        ))}
      </CardContent>
    </Card>
  );
}

function PlatformRow({ stats }: { stats: PlatformStats }) {
  const meta = PLATFORM_MAP[stats.platform];
  const Icon = meta.icon;
  const changePositive = stats.changePercent >= 0;

  return (
    <div className="flex items-center gap-4 p-3 border rounded-lg">
      <div className={`rounded-lg p-2 bg-muted`}>
        <Icon className={`h-5 w-5 ${meta.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{meta.name}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              changePositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            }`}
          >
            {changePositive ? '+' : ''}
            {stats.changePercent}%
          </span>
        </div>
        <SentimentBar positive={stats.positive} neutral={stats.neutral} negative={stats.negative} />
      </div>
      <div className="text-right">
        <p className="font-mono font-medium">{stats.mentions.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">mentions</p>
      </div>
      <div className="text-right w-20">
        <p className="font-mono font-medium">{stats.engagement}%</p>
        <p className="text-xs text-muted-foreground">engagement</p>
      </div>
    </div>
  );
}

interface SentimentBarProps {
  positive: number;
  neutral: number;
  negative: number;
}

function SentimentBar({ positive, neutral, negative }: SentimentBarProps) {
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden flex">
        <div className="bg-green-500" style={{ width: `${positive}%` }} />
        <div className="bg-amber-500" style={{ width: `${neutral}%` }} />
        <div className="bg-red-500" style={{ width: `${negative}%` }} />
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {positive}% / {neutral}% / {negative}%
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mentions
// ---------------------------------------------------------------------------

interface MentionsPanelProps {
  mentions: Mention[];
}

function MentionsPanel({ mentions }: MentionsPanelProps) {
  const [platformFilter, setPlatformFilter] = useState<PlatformId | 'all'>('all');

  const filtered =
    platformFilter === 'all' ? mentions : mentions.filter(m => m.platform === platformFilter);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Mentions</CardTitle>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search mentions..."
            className="rounded-lg border p-2 w-64"
          />
          <select
            className="rounded-lg border p-2"
            value={platformFilter}
            onChange={e => setPlatformFilter(e.target.value as PlatformId | 'all')}
          >
            <option value="all">All Platforms</option>
            {PLATFORMS.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filtered.map(mention => (
            <MentionCard key={mention.id} mention={mention} />
          ))}
          {filtered.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              No mentions from this platform yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MentionCard({ mention }: { mention: Mention }) {
  const meta = PLATFORM_MAP[mention.platform];
  const Icon = meta.icon;

  return (
    <div className="p-4 border rounded-lg bg-muted/30">
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0`}
        >
          <Icon className={`h-4 w-4 ${meta.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{mention.author}</span>
            <span className="text-xs text-muted-foreground">{meta.name}</span>
            <SentimentBadge sentiment={mention.sentiment} />
            {mention.reach !== undefined && (
              <span className="text-xs text-muted-foreground">
                {mention.reach.toLocaleString()} reach
              </span>
            )}
            <span className="text-xs text-muted-foreground ml-auto">{mention.time}</span>
          </div>
          <p className="mt-1 text-sm">{mention.content}</p>
        </div>
      </div>
    </div>
  );
}

function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const styles: Record<Sentiment, string> = {
    positive: 'bg-green-500/10 text-green-500',
    neutral: 'bg-amber-500/10 text-amber-500',
    negative: 'bg-red-500/10 text-red-500',
  };
  return <span className={`text-xs px-2 py-0.5 rounded ${styles[sentiment]}`}>{sentiment}</span>;
}

// ---------------------------------------------------------------------------
// Sentiment tab
// ---------------------------------------------------------------------------

function SentimentPanel() {
  const totals = PLATFORM_STATS.reduce(
    (acc, s) => ({
      positive: acc.positive + s.positive,
      neutral: acc.neutral + s.neutral,
      negative: acc.negative + s.negative,
    }),
    { positive: 0, neutral: 0, negative: 0 }
  );
  const total = totals.positive + totals.neutral + totals.negative;
  const positivePct = Math.round((totals.positive / total) * 100);
  const neutralPct = Math.round((totals.neutral / total) * 100);
  const negativePct = Math.round((totals.negative / total) * 100);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Overall Sentiment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <SentimentSummaryCard label="Positive" value={positivePct} color="text-green-500" />
            <SentimentSummaryCard label="Neutral" value={neutralPct} color="text-amber-500" />
            <SentimentSummaryCard label="Negative" value={negativePct} color="text-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sentiment by Platform</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {PLATFORM_STATS.map(s => (
            <PlatformRow key={s.platform} stats={s} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

interface SentimentSummaryCardProps {
  label: string;
  value: number;
  color: string;
}

function SentimentSummaryCard({ label, value, color }: SentimentSummaryCardProps) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <div className={`text-4xl font-bold ${color}`}>{value}%</div>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

function ReportsPanel() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Reports</CardTitle>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Scheduled reports and exports coming soon</p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Empty card
// ---------------------------------------------------------------------------

interface EmptyCardProps {
  title: string;
  message: string;
}

function EmptyCard({ title, message }: EmptyCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
