'use client';

import { ReactNode } from 'react';

export const PLATFORM_MAP: Record<string, { name: string; color: string }> = {};
export const PLATFORMS: string[] = [];

export interface Mention {
  id: string;
  platform: string;
  author: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  time: string;
  reach: number;
}

export interface PlatformStats {
  platform: string;
  mentions: number;
  changePercent: number;
  positive: number;
  neutral: number;
  negative: number;
  engagement: number;
}

function Stub({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) {
  return <div {...props}>{children}</div>;
}

export const SocialListening = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
export const SocialListeningEmpty = Stub;
export const SocialListeningHeader = Stub;
export const SocialListeningKeywords = Stub;
export const SocialListeningKpiStrip = Stub;
export const SocialListeningMentionFilters = Stub;
export const SocialListeningMentionList = Stub;
export const SocialListeningPlatformChips = Stub;
export const SocialListeningPlatformDetail = Stub;
export const SocialListeningPlatformRow = Stub;
export const SocialListeningTab = Stub;
export const SocialListeningTabPanel = Stub;
export const SocialListeningTabs = Stub;
export const SocialListeningTabsList = Stub;
export const SocialListeningVolumeChart = Stub;
