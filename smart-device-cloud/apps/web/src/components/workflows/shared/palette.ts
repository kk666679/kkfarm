import {
  Zap,
  Square,
  GitBranch,
  Clock,
  Smartphone,
  Plug,
  Sparkles,
  BookOpen,
  ShieldCheck,
  User,
  PenTool,
  Video,
  Image as ImageIcon,
  CalendarClock,
  Flame,
  Send,
  UserCircle,
} from 'lucide-react';
import type { NodeCategory } from '../types';

export interface PaletteItem {
  type: string;
  label: string;
  icon: typeof Zap;
  category: NodeCategory;
  description: string;
  data?: Record<string, unknown>;
}

export const PALETTE: PaletteItem[] = [
  {
    type: 'custom',
    label: 'Trigger',
    icon: Zap,
    category: 'flow',
    description: 'Start the workflow',
    data: { type: 'trigger' },
  },
  {
    type: 'custom',
    label: 'Action',
    icon: Square,
    category: 'flow',
    description: 'Execute a step',
    data: { type: 'action' },
  },
  {
    type: 'custom',
    label: 'Condition',
    icon: GitBranch,
    category: 'flow',
    description: 'Branch on a condition',
    data: { type: 'condition' },
  },
  {
    type: 'custom',
    label: 'Delay',
    icon: Clock,
    category: 'flow',
    description: 'Wait for a duration',
    data: { type: 'delay' },
  },

  {
    type: 'device',
    label: 'Device',
    icon: Smartphone,
    category: 'device',
    description: 'Control a device',
  },
  {
    type: 'integration',
    label: 'Integration',
    icon: Plug,
    category: 'device',
    description: 'Call an external service',
  },

  {
    type: 'ai',
    label: 'AI',
    icon: Sparkles,
    category: 'intelligence',
    description: 'Run an AI prompt',
  },
  {
    type: 'skill',
    label: 'Skill',
    icon: BookOpen,
    category: 'intelligence',
    description: 'Invoke an Agent Skill',
  },

  {
    type: 'content-post',
    label: 'Generate Post',
    icon: PenTool,
    category: 'content',
    description: 'Multi-platform post',
  },
  {
    type: 'content-video',
    label: 'Generate Video',
    icon: Video,
    category: 'content',
    description: 'AI short video',
  },
  {
    type: 'content-image',
    label: 'Generate Image',
    icon: ImageIcon,
    category: 'content',
    description: 'AI visual assets',
  },
  {
    type: 'content-trend',
    label: 'Detect Trend',
    icon: Flame,
    category: 'content',
    description: 'Social trend scan',
  },
  {
    type: 'content-schedule',
    label: 'Schedule',
    icon: CalendarClock,
    category: 'content',
    description: 'Adaptive scheduling',
  },
  {
    type: 'content-publish',
    label: 'Publish',
    icon: Send,
    category: 'content',
    description: 'Multi-platform publish',
  },
  {
    type: 'account',
    label: 'Account',
    icon: UserCircle,
    category: 'content',
    description: 'Create / warmup account',
  },

  {
    type: 'gate',
    label: 'Gate',
    icon: ShieldCheck,
    category: 'control',
    description: 'Require approval',
  },
  {
    type: 'human',
    label: 'Human',
    icon: User,
    category: 'control',
    description: 'Wait for a human',
  },
];

export const CATEGORY_LABELS: Record<NodeCategory, string> = {
  flow: 'Flow',
  device: 'Device',
  intelligence: 'Intelligence',
  content: 'Content',
  control: 'Control',
  structure: 'Structure',
};
