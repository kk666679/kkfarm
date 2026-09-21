/**
 * Sidebar — Control-plane navigation.
 *
 * State ownership:
 *   - useSidebarStore is the single source of truth for open/closed.
 *   - Sidebar does NOT render a mobile overlay or hamburger;
 *     Layout owns both (overlay + SidebarTrigger).
 *
 * Responsive:
 *   - < 480px  : off-canvas, translate-x based on isOpen
 *   - >= 480px : docked, w-64 (open) or w-20 (collapsed icon rail)
 *
 * Accessibility:
 *   - <nav aria-label="Primary"> wrapping <ul>/<li>.
 *   - aria-current="page" on the active link.
 *   - Icons decorative (aria-hidden).
 *   - Collapsed links retain accessible name via title attribute.
 */

import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/store/sidebar.store';

export interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: number;
  danger?: boolean;
  /** If true, only exact pathname matches. Default: match href and descendants. */
  exact?: boolean;
}

export interface NavCategory {
  category: string;
  items: NavItem[];
}

interface SidebarProps {
  navigation: NavCategory[];
  onItemClick?: () => void;
}

const ICON_MAP: Record<string, Icons.LucideIcon> = {
  LayoutDashboard: Icons.LayoutDashboard,
  Smartphone: Icons.Smartphone,
  Bot: Icons.Bot,
  Users: Icons.Users,
  GitBranch: Icons.GitBranch,
  PenTool: Icons.PenTool,
  Video: Icons.Video,
  Calendar: Icons.Calendar,
  Radio: Icons.Radio,
  UserCircle: Icons.UserCircle,
  Sparkles: Icons.Sparkles,
  Wrench: Icons.Wrench,
  Plug: Icons.Plug,
  Trophy: Icons.Trophy,
  Brain: Icons.Brain,
  Shield: Icons.Shield,
  ScrollText: Icons.ScrollText,
  DollarSign: Icons.DollarSign,
  Stethoscope: Icons.Stethoscope,
  HelpCircle: Icons.HelpCircle,
  CheckSquare: Icons.CheckSquare,
  UserCog: Icons.UserCog,
  KeyRound: Icons.KeyRound,
  Scale: Icons.Scale,
  Building: Icons.Building,
  BadgeCheck: Icons.BadgeCheck,
  ToggleLeft: Icons.ToggleLeft,
  FlaskConical: Icons.FlaskConical,
  PowerOff: Icons.PowerOff,
  Activity: Icons.Activity,
  CircleDot: Icons.CircleDot,
  FileText: Icons.FileText,
  Cpu: Icons.Cpu,
  Monitor: Icons.Monitor,
  List: Icons.List,
  Play: Icons.Play,
  Heart: Icons.Heart,
  BarChart3: Icons.BarChart3,
  Zap: Icons.Zap,
  Wifi: Icons.Wifi,
  WifiOff: Icons.WifiOff,
  Bell: Icons.Bell,
  AlertTriangle: Icons.AlertTriangle,
  Clock: Icons.Clock,
  MapPin: Icons.MapPin,
  Layers: Icons.Layers,
  Settings: Icons.Settings,
};

function getIcon(name: string): Icons.LucideIcon {
  return ICON_MAP[name] ?? Icons.Zap;
}

function isItemActive(item: NavItem, pathname: string): boolean {
  if (item.exact) return pathname === item.href;
  if (pathname === item.href) return true;
  return pathname.startsWith(item.href + '/');
}

export function Sidebar({ navigation, onItemClick }: SidebarProps) {
  const { isOpen } = useSidebarStore();
  const location = useLocation();
  const collapsed = !isOpen;

  const activeCategory = useMemo(() => {
    for (const cat of navigation) {
      if (cat.items.some(i => isItemActive(i, location.pathname))) {
        return cat.category;
      }
    }
    return null;
  }, [navigation, location.pathname]);

  return (
    <aside
      id="sidebar-navigation"
      aria-label="Main navigation"
      data-active-category={activeCategory ?? undefined}
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card',
        'transition-[width,transform] duration-300 ease-out',
        'max-[479px]:w-64',
        collapsed ? 'max-[479px]:-translate-x-full' : 'max-[479px]:translate-x-0',
        'min-[480px]:relative min-[480px]:translate-x-0',
        collapsed ? 'min-[480px]:w-20' : 'min-[480px]:w-64'
      )}
    >
      <div
        className={cn(
          'flex items-center gap-3 border-b border-border px-4 py-6',
          collapsed && 'min-[480px]:justify-center min-[480px]:px-2'
        )}
      >
        <div
          className="h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br from-primary to-accent"
          aria-hidden="true"
        />
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate font-bold text-foreground">Farm</div>
            <div className="truncate text-xs text-muted-foreground">Orchestration</div>
          </div>
        )}
      </div>

      <nav
        aria-label="Primary"
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4"
      >
        <ul role="list" className="space-y-6">
          {navigation.map(category => (
            <li key={category.category}>
              {!collapsed && (
                <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {category.category}
                </div>
              )}
              <ul role="list" className="space-y-1">
                {category.items.map(item => {
                  const active = isItemActive(item, location.pathname);
                  const Icon = getIcon(item.icon);
                  const showBadge =
                    typeof item.badge === 'number' && item.badge > 0;

                  return (
                    <li key={item.href} className="relative">
                      <Link
                        to={item.href}
                        onClick={onItemClick}
                        aria-current={active ? 'page' : undefined}
                        title={collapsed ? item.name : undefined}
                        className={cn(
                          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                          active
                            ? 'bg-accent font-medium text-accent-foreground'
                            : item.danger
                              ? 'text-destructive hover:bg-destructive/10'
                              : 'text-foreground/80 hover:bg-muted hover:text-foreground',
                          collapsed && 'min-[480px]:justify-center min-[480px]:px-2'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate">{item.name}</span>
                            {showBadge && (
                              <span
                                className={cn(
                                  'rounded-full px-2 py-0.5 text-xs font-semibold',
                                  item.danger
                                    ? 'bg-destructive text-destructive-foreground'
                                    : 'bg-primary text-primary-foreground'
                                )}
                              >
                                {item.badge! > 99 ? '99+' : item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                      {collapsed && showBadge && (
                        <span
                          className="pointer-events-none absolute right-1 top-1 hidden h-2 w-2 rounded-full bg-primary min-[480px]:block"
                          aria-hidden="true"
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}