'use client';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/workflows';
import { WorkflowTemplateCard } from '@/components/workflows/WorkflowTemplateCard';
import { WorkflowTemplatePreview } from '@/components/workflows/WorkflowTemplatePreview';
import { WorkflowFilters } from '@/components/workflows/WorkflowFilters';
import { trpc } from '@/trpc/client';

const CATEGORIES = ['all', 'device-ops', 'content', 'integration', 'monitoring'] as const;

export default function WorkflowTemplatesPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('all');
  const [preview, setPreview] = useState<any | null>(null);

  const query = trpc.workflow.list.useQuery({ limit: 50 });

  const useTemplate = (templateId: string) => {
    navigate(`/workflows/builder/new?templateId=${encodeURIComponent(templateId)}`);
  };

  const filtered = useMemo(() => {
    const all = query.data?.workflows ?? [];
    const q = search.trim().toLowerCase();
    return all
      .filter((t: any) => category === 'all' || t.category === category)
      .filter(
        (t: any) =>
          !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
  }, [query.data, category, search]);

  return (
    <PageContainer className="space-y-4">
      <PageHeader
        title="Workflow Templates"
        description="Pre-built workflows to get you started"
        breadcrumbs={[{ label: 'Workflows', href: '/workflows' }, { label: 'Templates' }]}
        actions={[
          {
            label: 'Create from Scratch',
            onClick: () => navigate('/workflows/builder/new'),
            icon: <Sparkles />,
            variant: 'secondary',
          },
        ]}
      />

      <WorkflowFilters
        search={search}
        onSearchChange={setSearch}
        status={category as any}
        onStatusChange={v => setCategory(v as any)}
      />

      {query.isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[320px] w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No templates match your filters"
          description="Try a different category or search term."
          action={{
            label: 'Clear filters',
            onClick: () => {
              setSearch('');
              setCategory('all');
            },
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template: any) => (
            <WorkflowTemplateCard
              key={template.id}
              template={template}
              onUse={() => useTemplate(template.id)}
              onPreview={() => setPreview(template)}
              loading={false}
            />
          ))}
        </div>
      )}

      <Dialog open={!!preview} onOpenChange={open => !open && setPreview(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{preview?.name}</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{preview.description}</p>
              <div className="h-[400px] overflow-hidden rounded-lg border border-border">
                <WorkflowTemplatePreview nodes={preview.nodes} edges={preview.edges} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPreview(null)}>
                  Cancel
                </Button>
                <Button onClick={() => useTemplate(preview.id)}>Use Template</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
