'use client';
import { useMemo } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type { ValidationIssue } from '../types';

export function useWorkflowValidation(nodes: Node[], edges: Edge[]) {
  return useMemo(() => {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    const cycles = detectCycles(nodes, edges);
    for (const cycle of cycles) {
      errors.push({
        type: 'error',
        nodeId: cycle[0],
        message: `Cycle detected: ${cycle.join(' → ')}`,
      });
    }

    const roots = nodes.filter(n => !edges.some(e => e.target === n.id));
    const reachable = new Set<string>();
    const queue = roots.map(n => n.id);
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (reachable.has(id)) continue;
      reachable.add(id);
      for (const e of edges.filter(e => e.source === id)) {
        queue.push(e.target);
      }
    }
    for (const node of nodes) {
      if (node.type === 'note' || node.type === 'group') continue;
      if (!reachable.has(node.id)) {
        errors.push({
          type: 'error',
          nodeId: node.id,
          message: `Node "${(node.data.label as string) ?? node.id}" is unreachable`,
        });
      }
    }

    for (const node of nodes) {
      if (node.type === 'note' || node.type === 'group') continue;
      const hasIn = edges.some(e => e.target === node.id);
      const hasOut = edges.some(e => e.source === node.id);
      if (!hasIn && !hasOut) {
        warnings.push({
          type: 'warning',
          nodeId: node.id,
          message: `Node "${(node.data.label as string) ?? node.id}" is isolated`,
        });
      }
    }

    return { errors, warnings };
  }, [nodes, edges]);
}

function detectCycles(nodes: Node[], edges: Edge[]): string[][] {
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    const list = adjacency.get(edge.source) ?? [];
    list.push(edge.target);
    adjacency.set(edge.source, list);
  }

  const WHITE = 0,
    GRAY = 1,
    BLACK = 2;
  const color = new Map(nodes.map(n => [n.id, WHITE]));
  const cycles: string[][] = [];

  const dfs = (id: string, path: string[]) => {
    color.set(id, GRAY);
    path.push(id);
    for (const next of adjacency.get(id) ?? []) {
      const c = color.get(next);
      if (c === GRAY) {
        cycles.push([...path.slice(path.indexOf(next)), next]);
      } else if (c === WHITE) {
        dfs(next, path);
      }
    }
    path.pop();
    color.set(id, BLACK);
  };

  for (const node of nodes) {
    if (color.get(node.id) === WHITE) dfs(node.id, []);
  }
  return cycles;
}
