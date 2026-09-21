'use client';
import { Play } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Node, Edge } from '@xyflow/react';
import { WorkflowTemplatePreview } from './WorkflowTemplatePreview';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'device-ops' | 'content' | 'integration' | 'monitoring';
  tags: string[];
  author: string;
  installCount: number;
  nodes: Node[];
  edges: Edge[];
}

export interface WorkflowTemplateCardProps {
  template: WorkflowTemplate;
  onUse: () => void;
  onPreview: () => void;
  loading?: boolean;
}

export function WorkflowTemplateCard({
  template,
  onUse,
  onPreview,
  loading = false,
}: WorkflowTemplateCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden border-border bg-card transition-colors hover:border-primary/50">
      <button
        type="button"
        onClick={onPreview}
        aria-label={`Preview ${template.name}`}
        className="relative block aspect-video w-full overflow-hidden bg-muted"
      >
        <WorkflowTemplatePreview nodes={template.nodes} edges={template.edges} />
      </button>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold">{template.name}</h3>
            <Badge variant="outline">{template.category}</Badge>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{template.description}</p>
        </div>

        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 4).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            {template.installCount.toLocaleString()} installs
          </span>
          <Button size="sm" onClick={onUse} disabled={loading}>
            <Play className="mr-1 h-3.5 w-3.5" />
            Use Template
          </Button>
        </div>
      </div>
    </Card>
  );
}
