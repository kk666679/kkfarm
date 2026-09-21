'use client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import type { ContentPlatformId } from '../types';

export interface ContentPreviewProps {
  platform: ContentPlatformId;
  author?: { name: string; handle: string; avatar?: string };
  content: string;
  hashtags?: string[];
  imageUrl?: string;
}

const PLATFORM_META: Record<
  ContentPlatformId,
  { label: string; aspect: string; maxChars: number }
> = {
  tiktok: { label: 'TikTok', aspect: 'aspect-[9/16]', maxChars: 2200 },
  instagram: { label: 'Instagram', aspect: 'aspect-square', maxChars: 2200 },
  youtube: { label: 'YouTube', aspect: 'aspect-video', maxChars: 5000 },
  linkedin: { label: 'LinkedIn', aspect: 'aspect-video', maxChars: 3000 },
  threads: { label: 'Threads', aspect: 'aspect-square', maxChars: 500 },
  facebook: { label: 'Facebook', aspect: 'aspect-square', maxChars: 63206 },
  xiaohongshu: { label: 'Xiaohongshu', aspect: 'aspect-[3/4]', maxChars: 1000 },
  shopee: { label: 'Shopee', aspect: 'aspect-square', maxChars: 3000 },
  shopify: { label: 'Shopify', aspect: 'aspect-square', maxChars: 10000 },
};

export function ContentPreview({
  platform,
  author,
  content,
  hashtags,
  imageUrl,
}: ContentPreviewProps) {
  const meta = PLATFORM_META[platform];
  const overLimit = content.length > meta.maxChars;

  return (
    <Card className="overflow-hidden border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-semibold">{meta.label}</span>
        <Badge variant={overLimit ? 'destructive' : 'outline'} className="text-[10px]">
          {content.length}/{meta.maxChars}
        </Badge>
      </div>
      <div className="space-y-2 p-3">
        {author && (
          <div className="flex items-center gap-2">
            {author.avatar ? (
              <img src={author.avatar} alt="" className="h-6 w-6 rounded-full" />
            ) : (
              <div className="h-6 w-6 rounded-full bg-muted" />
            )}
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium">{author.name}</p>
              <p className="truncate text-[10px] text-muted-foreground">@{author.handle}</p>
            </div>
          </div>
        )}
        {imageUrl && (
          <div className={`w-full overflow-hidden rounded ${meta.aspect} bg-muted`}>
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <p className="whitespace-pre-wrap text-[11px] leading-relaxed">{content}</p>
        {hashtags && hashtags.length > 0 && (
          <p className="text-[11px] text-blue-500">
            {hashtags.map(h => `#${h.replace(/^#/, '')}`).join(' ')}
          </p>
        )}
        <div className="flex items-center gap-3 border-t border-border pt-2 text-muted-foreground">
          <Heart className="h-3 w-3" />
          <MessageCircle className="h-3 w-3" />
          <Share2 className="h-3 w-3" />
        </div>
      </div>
    </Card>
  );
}
