import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Plus, Zap, BarChart3, Users, Settings, Mic, Bot } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Register Device',
      icon: Plus,
      onClick: () => navigate('/devices?action=register'),
      variant: 'default' as const,
    },
    {
      label: 'AI Assistant',
      icon: Bot,
      onClick: () => navigate('/content/studio'),
      variant: 'outline' as const,
    },
    {
      label: 'View Analytics',
      icon: BarChart3,
      onClick: () => navigate('/dashboard/analytics'),
      variant: 'outline' as const,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map(action => (
        <Button key={action.label} variant={action.variant} onClick={action.onClick} size="sm">
          <action.icon className="mr-2 h-4 w-4" />
          {action.label}
        </Button>
      ))}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Zap className="mr-2 h-4 w-4" />
            More
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate('/workflows/graph')}>
            <Settings className="mr-2 h-4 w-4" />
            Automation Rules
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/support/kb')}>
            <Users className="mr-2 h-4 w-4" />
            Reservations
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
