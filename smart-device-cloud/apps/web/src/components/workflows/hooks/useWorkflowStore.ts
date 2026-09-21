'use client';
import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react';

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  dirty: boolean;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node) => void;
  updateNodeData: (id: string, patch: Record<string, unknown>) => void;
  updateEdgeData: (id: string, patch: Record<string, unknown>) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;
  setSelectedNode: (id: string | null) => void;
  setSelectedEdge: (id: string | null) => void;
  setWorkflow: (nodes: Node[], edges: Edge[]) => void;
  reset: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  dirty: false,

  onNodesChange: changes => set({ nodes: applyNodeChanges(changes, get().nodes), dirty: true }),

  onEdgesChange: changes => set({ edges: applyEdgeChanges(changes, get().edges), dirty: true }),

  onConnect: connection =>
    set({
      edges: addEdge({ ...connection, type: 'bezier', data: { status: 'idle' } }, get().edges),
      dirty: true,
    }),

  addNode: node => set({ nodes: [...get().nodes, node], dirty: true }),

  updateNodeData: (id, patch) =>
    set({
      nodes: get().nodes.map(n => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
      dirty: true,
    }),

  updateEdgeData: (id, patch) =>
    set({
      edges: get().edges.map(e => (e.id === id ? { ...e, data: { ...e.data, ...patch } } : e)),
      dirty: true,
    }),

  deleteNode: id =>
    set({
      nodes: get().nodes.filter(n => n.id !== id),
      edges: get().edges.filter(e => e.source !== id && e.target !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
      dirty: true,
    }),

  deleteEdge: id =>
    set({
      edges: get().edges.filter(e => e.id !== id),
      selectedEdgeId: get().selectedEdgeId === id ? null : get().selectedEdgeId,
      dirty: true,
    }),

  setSelectedNode: id => set({ selectedNodeId: id, selectedEdgeId: null }),
  setSelectedEdge: id => set({ selectedEdgeId: id, selectedNodeId: null }),

  setWorkflow: (nodes, edges) =>
    set({ nodes, edges, selectedNodeId: null, selectedEdgeId: null, dirty: false }),

  reset: () =>
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      dirty: false,
    }),
}));
