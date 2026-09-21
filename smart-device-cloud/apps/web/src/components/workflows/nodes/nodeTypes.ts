import type { NodeTypes } from '@xyflow/react';
import { CustomNode } from './CustomNode';
import { DeviceNode } from './DeviceNode';
import { IntegrationNode } from './IntegrationNode';
import { AiNode } from './AiNode';
import { SkillNode } from './SkillNode';
import { GateNode } from './GateNode';
import { HumanNode } from './HumanNode';
import { GroupNode } from './GroupNode';
import { NoteNode } from './NoteNode';
import { ContentPostNode } from './ContentPostNode';
import { ContentVideoNode } from './ContentVideoNode';
import { ContentImageNode } from './ContentImageNode';
import { ContentScheduleNode } from './ContentScheduleNode';
import { ContentTrendNode } from './ContentTrendNode';
import { ContentPublishNode } from './ContentPublishNode';
import { AccountNode } from './AccountNode';

export const nodeTypes: NodeTypes = {
  custom: CustomNode,
  device: DeviceNode,
  integration: IntegrationNode,
  ai: AiNode,
  skill: SkillNode,
  gate: GateNode,
  human: HumanNode,
  group: GroupNode,
  note: NoteNode,
  'content-post': ContentPostNode,
  'content-video': ContentVideoNode,
  'content-image': ContentImageNode,
  'content-schedule': ContentScheduleNode,
  'content-trend': ContentTrendNode,
  'content-publish': ContentPublishNode,
  account: AccountNode,
};
