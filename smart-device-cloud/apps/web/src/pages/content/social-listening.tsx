'use client';

import {
  SocialListening,
  SocialListeningEmpty,
  SocialListeningHeader,
  SocialListeningKeywords,
  SocialListeningKpiStrip,
  SocialListeningMentionFilters,
  SocialListeningMentionList,
  SocialListeningPlatformChips,
  SocialListeningPlatformDetail,
  SocialListeningPlatformRow,
  SocialListeningTab,
  SocialListeningTabPanel,
  SocialListeningTabs,
  SocialListeningTabsList,
  SocialListeningVolumeChart,
  type Mention,
  type PlatformStats,
} from '~/components/ui/social-listening';
import { PLATFORM_MAP, PLATFORMS } from '~/components/ui/social-listening';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const OVERVIEW_STATS = {
  totalMentions: 12453,
  totalChange: 12,
  positivePercent: 78,
  positiveChange: 5,
  engagementRate: 4.2,
  engagementChange: -1.2,
  shareOfVoice: 34,
  shareChange: 3,
};

const PLATFORM_STATS: PlatformStats[] = [
  {
    platform: 'tiktok',
    mentions: 3820,
    changePercent: 24,
    positive: 82,
    neutral: 12,
    negative: 6,
    engagement: 6.8,
  },
  {
    platform: 'instagram',
    mentions: 2410,
    changePercent: 15,
    positive: 79,
    neutral: 14,
    negative: 7,
    engagement: 5.2,
  },
  {
    platform: 'youtube',
    mentions: 1890,
    changePercent: 8,
    positive: 81,
    neutral: 13,
    negative: 6,
    engagement: 4.1,
  },
  {
    platform: 'linkedin',
    mentions: 1120,
    changePercent: 18,
    positive: 88,
    neutral: 9,
    negative: 3,
    engagement: 3.4,
  },
  {
    platform: 'threads',
    mentions: 980,
    changePercent: 42,
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
    changePercent: 11,
    positive: 76,
    neutral: 15,
    negative: 9,
    engagement: 3.8,
  },
  {
    platform: 'shopify',
    mentions: 410,
    changePercent: 7,
    positive: 84,
    neutral: 11,
    negative: 5,
    engagement: 3.1,
  },
  {
    platform: 'n8n',
    mentions: 210,
    changePercent: 28,
    positive: 91,
    neutral: 7,
    negative: 2,
    engagement: 5.4,
  },
  {
    platform: 'zeppy',
    mentions: 103,
    changePercent: 55,
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
// Page
// ---------------------------------------------------------------------------

export default function SocialListeningPage() {
  const totalPositive = PLATFORM_STATS.reduce((s, p) => s + p.positive, 0);
  const totalNeutral = PLATFORM_STATS.reduce((s, p) => s + p.neutral, 0);
  const totalNegative = PLATFORM_STATS.reduce((s, p) => s + p.negative, 0);
  const total = totalPositive + totalNeutral + totalNegative;
  const positivePct = Math.round((totalPositive / total) * 100);
  const neutralPct = Math.round((totalNeutral / total) * 100);
  const negativePct = Math.round((totalNegative / total) * 100);

  return (
    <SocialListening>
      <SocialListeningHeader />

      <SocialListeningTabs defaultValue="overview">
        <SocialListeningTabsList>
          <SocialListeningTab value="overview">Overview</SocialListeningTab>
          <SocialListeningTab value="platforms">Platforms</SocialListeningTab>
          <SocialListeningTab value="mentions">Mentions</SocialListeningTab>
          <SocialListeningTab value="sentiment">Sentiment</SocialListeningTab>
          <SocialListeningTab value="competitors">Competitors</SocialListeningTab>
          <SocialListeningTab value="reports">Reports</SocialListeningTab>
        </SocialListeningTabsList>

        {/* Overview --------------------------------------------------- */}
        <SocialListeningTabPanel value="overview">
          <SocialListeningKpiStrip stats={OVERVIEW_STATS} />
          <div className="grid gap-4 md:grid-cols-2">
            <SocialListeningVolumeChart data={WEEKLY_VOLUME} />
            <SocialListeningKeywords keywords={TOP_KEYWORDS} />
          </div>
        </SocialListeningTabPanel>

        {/* Platforms -------------------------------------------------- */}
        <SocialListeningTabPanel value="platforms">
          <div className="space-y-3">
            {PLATFORM_STATS.map(stats => (
              <SocialListeningPlatformDetail key={stats.platform} stats={stats} />
            ))}
          </div>
        </SocialListeningTabPanel>

        {/* Mentions --------------------------------------------------- */}
        <SocialListeningTabPanel value="mentions">
          <div className="space-y-4 rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold">Recent Mentions</h3>
              <SocialListeningMentionFilters showSentiment />
            </div>
            <SocialListeningMentionList mentions={MENTIONS} />
          </div>
        </SocialListeningTabPanel>

        {/* Sentiment -------------------------------------------------- */}
        <SocialListeningTabPanel value="sentiment">
          <div className="grid gap-4 md:grid-cols-3">
            <SentimentSummaryCard label="Positive" value={positivePct} tone="positive" />
            <SentimentSummaryCard label="Neutral" value={neutralPct} tone="neutral" />
            <SentimentSummaryCard label="Negative" value={negativePct} tone="negative" />
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-3 font-semibold">Sentiment by Platform</h3>
            <div className="space-y-3">
              {PLATFORM_STATS.map(stats => (
                <SocialListeningPlatformRow key={stats.platform} stats={stats} />
              ))}
            </div>
          </div>
        </SocialListeningTabPanel>

        {/* Competitors ------------------------------------------------ */}
        <SocialListeningTabPanel value="competitors">
          <SocialListeningEmpty
            title="Competitor Analysis"
            message="Competitor tracking coming soon"
          />
        </SocialListeningTabPanel>

        {/* Reports ---------------------------------------------------- */}
        <SocialListeningTabPanel value="reports">
          <SocialListeningEmpty
            title="Reports"
            message="Scheduled reports and exports coming soon"
          />
        </SocialListeningTabPanel>
      </SocialListeningTabs>
    </SocialListening>
  );
}

// ---------------------------------------------------------------------------
// Small helper — sentiment summary card
// ---------------------------------------------------------------------------

interface SentimentSummaryCardProps {
  label: string;
  value: number;
  tone: 'positive' | 'neutral' | 'negative';
}

const TONE_COLORS: Record<SentimentSummaryCardProps['tone'], string> = {
  positive: 'text-green-500',
  neutral: 'text-amber-500',
  negative: 'text-red-500',
};

function SentimentSummaryCard({ label, value, tone }: SentimentSummaryCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6 text-center">
      <div className={`text-4xl font-bold ${TONE_COLORS[tone]}`}>{value}%</div>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
