import { Image as ImageIcon, Video, Layers, FileText, Sparkles, BookOpen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContentType } from '../types';

const MAP: Record<ContentType, { label: string; icon: LucideIcon; className: string }> = {
  post: { label: 'Post', icon: FileText, className: 'bg-muted text-foreground' },
  image: { label: 'Image', icon: ImageIcon, className: 'bg-muted text-foreground' },
  carousel: { label: 'Carousel', icon: Layers, className: 'bg-muted text-foreground' },
  video: { label: 'Video', icon: Video, className: 'bg-muted text-foreground' },
  reel: { label: 'Reel', icon: Sparkles, className: 'bg-primary/10 text-primary' },
  story: { label: 'Story', icon: Sparkles, className: 'bg-primary/10 text-primary' },
  article: { label: 'Article', icon: BookOpen, className: 'bg-muted text-foreground' },
};

export function ContentTypeBadge({ type, className, showIcon = true }: { type: ContentType; className?: string; showIcon?: boolean }) {
  const spec = MAP[type] ?? MAP.post;
  const Icon = spec.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium', spec.className, className)}>
      {showIcon && <Icon className="h-3 w-3" aria-hidden="true" />}
      {spec.label}
    </span>
  );
}
