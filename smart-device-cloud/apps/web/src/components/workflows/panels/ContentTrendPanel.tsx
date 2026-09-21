'use client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TrendItem } from '../types';

export interface ContentTrendPanelProps {
  trends: TrendItem[];
  onTrendClick?: (trend: TrendItem) => void;
}

export function ContentTrendPanel({ trends, onTrendClick }: ContentTrendPanelProps) {
  return (
    <Card className="border-border bg-card p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold">Trending Topics</span>
        <Badge variant="secondary" className="text-[10px]">
          {trends.length}
        </Badge>
      </div>
      <div className="space-y-1.5">
        {trends.length === 0 ? (
          <p className="py-4 text-center text-[11px] text-muted-foreground">No trends detected</p>
        ) : (
          trends.map((trend, i) => {
            const Velocity = trend.velocity > 0 ? TrendingUp : TrendingDown;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onTrendClick?.(trend)}
                className="flex w-full items-center gap-2 rounded-md border border-border bg-muted/20 p-2 text-left transition-colors hover:bg-accent/50"
              >
                <Flame className="h-3.5 w-3.5 shrink-0 text-fuchsia-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium">{trend.topic}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{trend.volume.toLocaleString()} mentions</span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-0.5',
                        trend.velocity > 0 ? 'text-emerald-500' : 'text-destructive'
                      )}
                    >
                      <Velocity className="h-3 w-3" />
                      {Math.abs(Math.round(trend.velocity * 100))}%
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] capitalize">
                  {trend.platform}
                </Badge>
              </button>
            );
          })
        )}
      </div>
    </Card>
  );
}
