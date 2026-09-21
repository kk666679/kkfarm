/**
 * MobileNav - Bottom navigation for mobile devices
 */

import { Link, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';

interface MobileNavItem {
  label: string;
  href: string;
  icon: string;
}

interface MobileNavProps {
  items: MobileNavItem[];
}

function getIcon(iconName: string) {
  const iconMap: Record<string, any> = {
    LayoutDashboard: Icons.LayoutDashboard,
    Smartphone: Icons.Smartphone,
    Bot: Icons.Bot,
    Users: Icons.Users,
    GitBranch: Icons.GitBranch,
    PenTool: Icons.PenTool,
    Settings: Icons.Settings,
  };
  return iconMap[iconName] || Icons.Zap;
}

export function MobileNav({ items }: MobileNavProps) {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white md:hidden">
      <div className="flex items-center justify-around">
        {items.map(item => {
          const isActive = location.pathname === item.href;
          const IconComponent = getIcon(item.icon);

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition ${
                isActive ? 'text-blue-600 border-t-2 border-blue-600 -mt-[2px]' : 'text-gray-600'
              }`}
            >
              <IconComponent className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
