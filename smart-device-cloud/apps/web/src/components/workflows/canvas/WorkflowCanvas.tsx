'use client';
import { forwardRef } from 'react';
import { ReactFlow, ReactFlowProvider, type ReactFlowProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './WorkflowCanvas.css';

export interface WorkflowCanvasProps extends ReactFlowProps {
  withProvider?: boolean;
}

export const WorkflowCanvas = forwardRef<HTMLDivElement, WorkflowCanvasProps>(
  function WorkflowCanvas(
    {
      children,
      withProvider = true,
      fitView = true,
      snapToGrid = true,
      snapGrid = [20, 20],
      colorMode = 'system',
      proOptions = { hideAttribution: true },
      ...rest
    },
    ref
  ) {
    const canvas = (
      <ReactFlow
        ref={ref}
        fitView={fitView}
        snapToGrid={snapToGrid}
        snapGrid={snapGrid}
        colorMode={colorMode}
        proOptions={proOptions}
        {...rest}
      >
        {children}
      </ReactFlow>
    );

    return withProvider ? <ReactFlowProvider>{canvas}</ReactFlowProvider> : canvas;
  }
);

WorkflowCanvas.displayName = 'WorkflowCanvas';
