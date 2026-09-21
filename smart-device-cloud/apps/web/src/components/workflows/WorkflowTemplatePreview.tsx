'use client';
import { ReactFlow, ReactFlowProvider, Background, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes, edgeTypes } from '@/components/workflows';

export interface WorkflowTemplatePreviewProps {
  nodes: Node[];
  edges: Edge[];
  interactive?: boolean;
}

export function WorkflowTemplatePreview({
  nodes,
  edges,
  interactive = false,
}: WorkflowTemplatePreviewProps) {
  return (
    <ReactFlowProvider>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={interactive}
        nodesConnectable={false}
        elementsSelectable={interactive}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        panOnDrag={interactive}
        panOnScroll={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} size={1} />
      </ReactFlow>
    </ReactFlowProvider>
  );
}
