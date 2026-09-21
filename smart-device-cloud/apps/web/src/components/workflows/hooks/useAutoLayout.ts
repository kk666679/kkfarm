'use client';
import { useCallback } from 'react';
import dagre from '@dagrejs/dagre';
import { useReactFlow } from '@xyflow/react';
import { NODE_WIDTHS } from '../shared/constants';

const NODE_HEIGHT = 100;

export function useAutoLayout() {
  const { getNodes, getEdges, setNodes } = useReactFlow();

  const layout = useCallback(
    (direction: 'TB' | 'LR' = 'TB') => {
      const nodes = getNodes();
      const edges = getEdges();

      const graph = new dagre.graphlib.Graph();
      graph.setDefaultEdgeLabel(() => ({}));
      graph.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80 });

      for (const node of nodes) {
        graph.setNode(node.id, { width: NODE_WIDTHS.default, height: NODE_HEIGHT });
      }
      for (const edge of edges) {
        graph.setEdge(edge.source, edge.target);
      }

      dagre.layout(graph);

      setNodes(
        nodes.map(node => {
          const pos = graph.node(node.id);
          return {
            ...node,
            position: {
              x: pos.x - NODE_WIDTHS.default / 2,
              y: pos.y - NODE_HEIGHT / 2,
            },
          };
        })
      );
    },
    [getNodes, getEdges, setNodes]
  );

  return { layout };
}
