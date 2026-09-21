import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FleetStatusDonut, type FleetStatusCounts } from '@/components/charts';

interface FleetCompositionCardProps {
  counts: FleetStatusCounts;
  title?: string;
  height?: number;
  className?: string;
}

export function FleetCompositionCard({
  counts,
  title = 'Fleet composition',
  height = 260,
  className,
}: FleetCompositionCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <FleetStatusDonut counts={counts} height={height} />
      </CardContent>
    </Card>
  );
}
