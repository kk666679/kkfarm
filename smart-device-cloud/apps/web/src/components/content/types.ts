export type ContentType = 'post' | 'image' | 'carousel' | 'video' | 'reel' | 'story' | 'article';
export type ContentStatus = 'draft' | 'pending-approval' | 'approved' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'archived';
export type ContentPlatform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook' | 'linkedin' | 'threads' | 'reddit';

export interface ContentAsset {
  id: string;
  kind: 'image' | 'video' | 'audio';
  url: string;
  thumbnailUrl?: string;
  durationMs?: number;
  width?: number;
  height?: number;
  sizeBytes?: number;
}

export interface ContentPerformance {
  impressions: number;
  engagements: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagementRate: number;
}

export interface ContentVariant {
  id: string;
  label: string;
  caption: string;
  assets?: ContentAsset[];
  platforms: ContentPlatform[];
  performance?: ContentPerformance;
}

export interface ContentItem {
  id: string;
  type: ContentType;
  status: ContentStatus;
  title: string;
  caption?: string;
  hashtags?: string[];
  assets: ContentAsset[];
  platforms: ContentPlatform[];
  accountIds: string[];
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  authorId?: string;
  authorName?: string;
  tags?: string[];
  performance?: ContentPerformance;
  variants?: ContentVariant[];
}

export interface ContentFilters {
  query?: string;
  status?: ContentStatus[];
  type?: ContentType[];
  platforms?: ContentPlatform[];
  tags?: string[];
  scheduledFrom?: string;
  scheduledTo?: string;
}

export type ContentViewMode = 'grid' | 'table';
export type ContentSortKey = 'updatedAt' | 'createdAt' | 'scheduledAt' | 'title';
export type ContentSortDir = 'asc' | 'desc';
export interface ContentSort { key: ContentSortKey; dir: ContentSortDir; }
