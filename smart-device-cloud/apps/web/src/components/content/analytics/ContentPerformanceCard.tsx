import { Eye, Heart, MessageCircle, Share2, Bookmark, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContentPerformance } from '../types';

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

interface ContentPerformanceCardProps {
  performance: ContentPerformance;
  className?: string;
}

export function ContentPerformanceCard({
  performance,
  className,
}: ContentPerformanceCardProps) {
  const rate = Math.max(0, Math.min(1, performance.engagementRate));

  const stats = [
    { icon: Eye, label: 'Impressions', value: performance.impressions },
    { icon: Heart, label: 'Likes', value: performance.likes },
    { icon: MessageCircle, label: 'Comments', value: performance.comments },
    { icon: Share2, label: 'Shares', value: performance.shares },
    { icon: Bookmark, label: 'Saves', value: performance.saves },
    { icon: TrendingUp, label: 'Engagements', value: performance.engagements },
  ];

  return (
    <div className={cn('rounded-lg border border-border bg-card', className)}>
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-base font-semibold text-foreground">Performance</h3>
      </div>
      <div className="space-y-4 p-4">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Engagement rate
            </span>
            <span className="text-lg font-semibold tabular-nums text-foreground">
              {(rate * 100).toFixed(2)}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(rate * 100)}
            className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${rate * 100}%` }}
            />
          </div>
        </div>

        <ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-3">
          {stats.map(s => {
            const Icon = s.icon;
            return (
              <li key={s.label} className="flex items-center gap-2">
                <Icon
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <div className="truncate text-xs text-muted-foreground">
                    {s.label}
                  </div>
                  <div className="text-sm font-medium tabular-nums text-foreground">
                    {fmt(s.value)}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
