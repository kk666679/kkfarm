import type { NavCategory } from '@/components/layout/Sidebar';


export const navigationConfig: NavCategory[] = [
  {
    category: 'Discover',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard', badge: 3 },
      { name: 'Devices', href: '/devices', icon: 'Smartphone', badge: 12 },
      { name: 'Device Dashboard', href: '/devices/dashboard', icon: 'LayoutGrid' },
      { name: 'Sessions', href: '/sessions', icon: 'Monitor' },
      { name: 'Activity', href: '/activity', icon: 'Activity' },
    ],
  },
  {
    category: 'Operate',
    items: [
      { name: 'Workflows', href: '/workflows', icon: 'GitBranch' },
      { name: 'Queue', href: '/queue', icon: 'List' },
    ],
  },
  {
    category: 'Intelligence',
    items: [
      { name: 'AI Assistant', href: '/assistant', icon: 'Brain' },
      { name: 'Agents', href: '/agents', icon: 'Cpu' },
      { name: 'Runs', href: '/runs', icon: 'Play' },
      { name: 'Insights', href: '/insights', icon: 'Sparkles' },
    ],
  },
  {
    category: 'Observe',
    items: [
      { name: 'Health', href: '/health', icon: 'Heart' },
      { name: 'Metrics', href: '/metrics', icon: 'BarChart3' },
      { name: 'Logs', href: '/logs', icon: 'ScrollText' },
      { name: 'Alerts', href: '/alerts', icon: 'Bell' },
    ],
  },
  {
    category: 'Workspace',
    items: [
      { name: 'Content', href: '/content', icon: 'PenTool' },
      { name: 'Settings', href: '/settings', icon: 'Settings' },
    ],
  },
];
