import { cn } from '@/lib/utils';
import type { ContentPlatform } from '../types';

const LABEL: Record<ContentPlatform, string> = { instagram: 'IG', tiktok: 'TT', youtube: 'YT', twitter: 'X', facebook: 'FB', linkedin: 'LI', threads: 'TH', reddit: 'RD' };
const COLOR: Record<ContentPlatform, string> = {
  instagram: 'bg-pink-500/10 text-pink-700 dark:text-pink-400',
  tiktok: 'bg-foreground/10 text-foreground',
  youtube: 'bg-red-500/10 text-red-700 dark:text-red-400',
  twitter: 'bg-foreground/10 text-foreground',
  facebook: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  linkedin: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
  threads: 'bg-foreground/10 text-foreground',
  reddit: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
};

export function PlatformBadge({ platform, className }: { platform: ContentPlatform; className?: string }) {
  return (
    <span className={cn('inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-[10px] font-semibold uppercase tracking-wide', COLOR[platform], className)} title={platform}>
      {LABEL[platform]}
    </span>
  );
}

export function PlatformBadgeList({ platforms, max = 4, className }: { platforms: ContentPlatform[]; max?: number; className?: string }) {
  const visible = platforms.slice(0, max);
  const overflow = platforms.length - visible.length;
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {visible.map(p => <PlatformBadge key={p} platform={p} />)}
      {overflow > 0 && <span className="text-xs text-muted-foreground">+{overflow}</span>}
    </div>
  );
}
