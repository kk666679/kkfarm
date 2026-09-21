import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'amber' | 'red';
}

export function KpiCard({ title, value, unit, trend, icon, color }: KpiCardProps) {
  const colorClasses = {
    blue: 'text-sky-400 bg-sky-400/10',
    green: 'text-emerald-400 bg-emerald-400/10',
    amber: 'text-amber-400 bg-amber-400/10',
    red: 'text-red-400 bg-red-400/10',
  };

  return (
    <Card className="border-white/5 bg-[#0f1525] p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-white/50">{title}</span>
        <div className={cn('rounded-lg p-1.5', colorClasses[color])}>{icon}</div>
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-white">
            {value}
            {unit && <span className="ml-1 text-sm font-normal text-white/50">{unit}</span>}
          </p>
        </div>
        {trend !== undefined && (
          <div
            className={cn(
              'flex items-center gap-0.5 text-xs',
              trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-white/40'
            )}
          >
            {trend > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : trend < 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </Card>
  );
}
