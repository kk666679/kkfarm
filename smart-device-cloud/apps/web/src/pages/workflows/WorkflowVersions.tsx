'use client';

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/workflows';
import { WorkflowVersionRow } from '@/components/workflows/WorkflowVersionRow';
import { WorkflowVersionDiff } from '@/components/workflows/WorkflowVersionDiff';
import { trpc } from '@/trpc/client';
import { useToast } from '@/components/ui/toaster';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  variant = 'default',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="workflow-version-confirm-title"
      >
        <h2 id="workflow-version-confirm-title" className="text-lg font-semibold">
          {title}
        </h2>
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={loading}>
            {loading ? 'Loading...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowVersionsPage() {
  const { workflowId } = useParams<{ workflowId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  // Keep this page compatible with the workflow procedures exposed by the app's
  // TRPC client, even when the generated client type has not been refreshed.
  const workflowTrpc = trpc as any;
  const utils = workflowTrpc.useUtils();

  const [baseVersionId, setBaseVersionId] = useState<string | null>(null);
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);

  const versionsQuery = workflowTrpc.workflows.versions.useQuery(
    { workflowId: workflowId! },
    { enabled: !!workflowId }
  );

  const diffQuery = workflowTrpc.workflows.diff.useQuery(
    { workflowId: workflowId!, baseVersionId: baseVersionId!, compareVersionId: compareVersionId! },
    { enabled: !!baseVersionId && !!compareVersionId }
  );

  const restoreMutation = workflowTrpc.workflows.restoreVersion.useMutation({
    onSuccess: () => {
      toast({ title: 'Version restored' });
      utils.workflows.versions.invalidate({ workflowId: workflowId! });
      setConfirmRestore(null);
    },
  });

  const deleteMutation = workflowTrpc.workflows.deleteVersion.useMutation({
    onSuccess: () => {
      toast({ title: 'Version deleted' });
      utils.workflows.versions.invalidate({ workflowId: workflowId! });
      setConfirmDelete(null);
    },
  });

  const versions = versionsQuery.data?.versions ?? [];
  const activeVersion = versions.find((v: any) => v.status === 'active');

  const selectVersion = (id: string) => {
    if (!baseVersionId || (baseVersionId && compareVersionId)) {
      setBaseVersionId(id);
      setCompareVersionId(null);
    } else if (baseVersionId && !compareVersionId && baseVersionId !== id) {
      setCompareVersionId(id);
    } else {
      setBaseVersionId(id);
      setCompareVersionId(null);
    }
  };

  const isSelected = (id: string) => id === baseVersionId || id === compareVersionId;

  if (versionsQuery.isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Workflow Versions" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-4">
      <PageHeader
        title="Workflow Versions"
        description="Browse, compare, and restore workflow history"
        breadcrumbs={[
          { label: 'Workflows', href: '/workflows' },
          { label: workflowId!.slice(0, 8), href: `/workflows/${workflowId}` },
          { label: 'Versions' },
        ]}
        actions={[
          {
            label: 'Edit current',
            onClick: () => navigate(`/workflows/${workflowId}/builder`),
          },
        ]}
      />

      {versions.length === 0 ? (
        <EmptyState
          title="No versions yet"
          description="Save the workflow to create the first version."
          action={{
            label: 'Go to builder',
            onClick: () => navigate(`/workflows/${workflowId}/builder`),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[400px_1fr]">
          <section aria-label="Version history" className="space-y-2">
            {versions.map((version: any) => (
              <WorkflowVersionRow
                key={version.id}
                version={version}
                isActive={version.id === activeVersion?.id}
                isSelected={isSelected(version.id)}
                isBase={version.id === baseVersionId}
                isCompare={version.id === compareVersionId}
                onSelect={() => selectVersion(version.id)}
                onRestore={() => setConfirmRestore(version)}
                onDelete={() => setConfirmDelete(version)}
              />
            ))}
          </section>

          <section aria-label="Version comparison">
            <WorkflowVersionDiff diff={diffQuery.data as any} loading={diffQuery.isLoading} />
          </section>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmRestore}
        title="Restore this version?"
        description={
          confirmRestore ? `This will create a new draft from v${confirmRestore.number}.` : ''
        }
        confirmLabel="Restore"
        onConfirm={() =>
          confirmRestore &&
          restoreMutation.mutate({ workflowId: workflowId!, versionId: confirmRestore.id })
        }
        onCancel={() => setConfirmRestore(null)}
        loading={restoreMutation.isPending}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete this version?"
        description={confirmDelete ? `v${confirmDelete.number} will be permanently removed.` : ''}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() =>
          confirmDelete &&
          deleteMutation.mutate({ workflowId: workflowId!, versionId: confirmDelete.id })
        }
        onCancel={() => setConfirmDelete(null)}
        loading={deleteMutation.isPending}
      />
    </PageContainer>
  );
}
