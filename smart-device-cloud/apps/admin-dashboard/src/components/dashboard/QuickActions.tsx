import React from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, BarChart3, Mic, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    { label: 'Register Device', icon: Plus, onClick: () => navigate('/devices') },
    { label: 'Analytics', icon: BarChart3, onClick: () => navigate('/analytics') },
    { label: 'Voice Control', icon: Mic, onClick: () => {} },
    { label: 'Settings', icon: Settings, onClick: () => navigate('/settings') },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map(action => (
        <Button key={action.label} variant="outline" size="sm" onClick={action.onClick}>
          <action.icon className="mr-2 h-4 w-4" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
