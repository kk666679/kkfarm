/**
 * AI interaction layer barrel.
 *
 * Existing files NOT re-exported yet (need props reconciliation):
 *   - AIDashboard.tsx
 *   - DeviceLogAnalyzer.tsx
 *   - VoiceDeviceController.tsx
 */

// Copilot surfaces
export { OperationsCopilot } from './OperationsCopilot';
export type { CopilotTurn, OperationsCopilotProps } from './OperationsCopilot';
export { CopilotPalette } from './CopilotPalette';

// Surface rendering — the only place AI output becomes React
export { AgentSurfaceRenderer } from './AgentSurfaceRenderer';

// Message rendering
export { AIMessageBubble } from './AIMessageBubble';
export { AIAvatar, roleLabel } from './AIAvatar';
export type { AIRole } from './AIAvatar';
export { AIStreamingText } from './AIStreamingText';
export { AILoadingDots } from './AILoadingDots';
export { AIActionBar } from './AIActionBar';
export { AIErrorFallback } from './AIErrorFallback';

// Agentic content
export { AgentThinking } from './AgentThinking';
export { AgentPlanCard } from './AgentPlanCard';
export { AgentToolCallList } from './AgentToolCallList';
export type { ToolCallEntry, ToolCallStatus } from './AgentToolCallList';
export { AgentActionProposal } from './AgentActionProposal';
export { ApprovalInbox } from './ApprovalInbox';

// Metadata + controls
export { AIModelBadge } from './AIModelBadge';
export { AICostMeter } from './AICostMeter';
export { AITokenBudget } from './AITokenBudget';
export { AIModeToggle, modeDescription } from './AIModeToggle';
export type { AIMode } from './AIModeToggle';
export { AIContextChips } from './AIContextChips';
export type { AIContextChip, ContextKind } from './AIContextChips';

// Prompt entry
export { AISuggestionChips } from './AISuggestionChips';
export { AIPromptSuggestions } from './AIPromptSuggestions';
export type { StarterPrompt } from './AIPromptSuggestions';
