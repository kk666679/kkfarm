import React from 'react';

export type ComponentVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export interface ButtonProps {
  variant?: ComponentVariant;
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export interface CardProps {
  title?: string;
  children?: React.ReactNode;
}

export interface CardHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

export interface CardTitleProps {
  children?: React.ReactNode;
  className?: string;
}

export interface CardContentProps {
  children?: React.ReactNode;
  className?: string;
}

export function Button(props: ButtonProps): React.ReactElement {
  return React.createElement(
    'button',
    { disabled: props.disabled, onClick: props.onClick },
    props.children
  );
}

export function Card(props: CardProps): React.ReactElement {
  return React.createElement(
    'div',
    undefined,
    props.title ? React.createElement('h3', undefined, props.title) : null,
    props.children
  );
}

export function CardHeader({ children, className = '' }: CardHeaderProps): React.ReactElement {
  return React.createElement('div', { className: `px-6 py-4 ${className}` }, children);
}

export function CardTitle({ children, className = '' }: CardTitleProps): React.ReactElement {
  return React.createElement('h3', { className: `text-lg font-semibold ${className}` }, children);
}

export function CardContent({ children, className = '' }: CardContentProps): React.ReactElement {
  return React.createElement('div', { className: `px-6 py-4 ${className}` }, children);
}

// Agentic components
export { AgentRunTimeline } from './agentic/agent-run-timeline';
export type { TimelineStep, StepStatus } from './agentic/agent-run-timeline';
export { AgentPlanView } from './agentic/agent-plan-view';
export type { PlanStep } from './agentic/agent-plan-view';
export { ToolCallCard } from './agentic/tool-call-card';
export type { ToolCall } from './agentic/tool-call-card';
export { ApprovalDialog } from './agentic/approval-dialog';
export type { ApprovalRequest } from './agentic/approval-dialog';
export { MemoryViewer } from './agentic/memory-viewer';
export type { MemoryEntry } from './agentic/memory-viewer';
export { EvalLeaderboard } from './agentic/eval-leaderboard';
export type { EvalEntry } from './agentic/eval-leaderboard';
export { TokenBudgetMeter } from './agentic/token-budget-meter';
export { CostDisplay } from './agentic/cost-display';

// Theme
export { ThemeProvider, useTheme } from './theme/provider';
export { tokens } from './theme/tokens';

// Utils
export { cn } from './utils/cn';
