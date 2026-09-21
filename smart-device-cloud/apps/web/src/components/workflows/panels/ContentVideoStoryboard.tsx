'use client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import type { StoryboardShot } from '../types';

export interface ContentVideoStoryboardProps {
  shots: StoryboardShot[];
  totalDuration: number;
}

export function ContentVideoStoryboard({ shots, totalDuration }: ContentVideoStoryboardProps) {
  return (
    <Card className="border-border bg-card p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold">Storyboard</span>
        <Badge variant="outline" className="text-[10px]">
          <Clock className="mr-1 h-3 w-3" />
          {totalDuration}s
        </Badge>
      </div>
      <div className="space-y-2">
        {shots.map(shot => (
          <div
            key={shot.index}
            className="flex gap-3 rounded-md border border-border bg-muted/20 p-2"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-fuchsia-500/10 text-xs font-semibold text-fuchsia-500">
              {shot.index}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium">{shot.durationSeconds}s</span>
                {shot.cameraAngle && (
                  <Badge variant="secondary" className="text-[9px]">
                    {shot.cameraAngle}
                  </Badge>
                )}
                {shot.status && (
                  <Badge
                    variant={
                      shot.status === 'done'
                        ? 'secondary'
                        : shot.status === 'failed'
                          ? 'destructive'
                          : 'outline'
                    }
                    className="text-[9px]"
                  >
                    {shot.status}
                  </Badge>
                )}
              </div>
              <p className="line-clamp-2 text-[11px] text-muted-foreground">{shot.description}</p>
              {shot.dialogue && (
                <p className="line-clamp-1 text-[10px] italic text-muted-foreground">
                  "{shot.dialogue}"
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
