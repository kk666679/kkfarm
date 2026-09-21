import type { EdgeTypes } from '@xyflow/react';
import { CustomBezierEdge } from './CustomBezierEdge';
import { CustomEdge } from './CustomEdge';

export const edgeTypes: EdgeTypes = {
  bezier: CustomBezierEdge,
  straight: CustomEdge,
};
