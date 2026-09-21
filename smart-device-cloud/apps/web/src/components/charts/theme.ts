/**
 * Chart theming.
 *
 * Colors are declared as CSS custom properties with hex fallbacks so charts
 * render whether or not the design system defines `--chart-*` tokens.
 * Override by setting those variables in globals.css.
 */

export const CHART_PALETTE = [
  'var(--chart-1, #3b82f6)',
  'var(--chart-2, #10b981)',
  'var(--chart-3, #f59e0b)',
  'var(--chart-4, #ef4444)',
  'var(--chart-5, #8b5cf6)',
  'var(--chart-6, #ec4899)',
] as const;

export const SEMANTIC_COLORS = {
  primary: 'var(--chart-1, #3b82f6)',
  success: 'var(--chart-2, #10b981)',
  warning: 'var(--chart-3, #f59e0b)',
  danger: 'var(--chart-4, #ef4444)',
  info: 'var(--chart-5, #8b5cf6)',
  accent: 'var(--chart-6, #ec4899)',
  muted: 'var(--muted-foreground, #94a3b8)',
  grid: 'var(--border, #e2e8f0)',
  axis: 'var(--muted-foreground, #94a3b8)',
  tooltipBg: 'var(--card, #ffffff)',
  tooltipBorder: 'var(--border, #e2e8f0)',
} as const;

/** Fixed-color mapping for domain concepts. Keeps status colors consistent. */
export const STATUS_COLORS = {
  online: SEMANTIC_COLORS.success,
  offline: SEMANTIC_COLORS.muted,
  busy: SEMANTIC_COLORS.warning,
  idle: SEMANTIC_COLORS.primary,
  error: SEMANTIC_COLORS.danger,
  maintenance: SEMANTIC_COLORS.info,
  provisioning: SEMANTIC_COLORS.accent,
} as const;

export const HEALTH_COLORS = {
  healthy: SEMANTIC_COLORS.success,
  degraded: SEMANTIC_COLORS.warning,
  unhealthy: SEMANTIC_COLORS.danger,
  unknown: SEMANTIC_COLORS.muted,
} as const;

export const DEFAULT_CHART_HEIGHT = 300;
export const DEFAULT_SPARKLINE_HEIGHT = 40;

export const AXIS_STYLE = {
  fontSize: 12,
  fill: SEMANTIC_COLORS.axis,
} as const;

export const GRID_STYLE = {
  stroke: SEMANTIC_COLORS.grid,
  strokeDasharray: '3 3',
  vertical: false,
} as const;

/** Safe random-but-stable color picker for dynamic series. */
export function paletteFor(index: number): string {
  return CHART_PALETTE[index % CHART_PALETTE.length];
}

/** Disable animations when the user prefers reduced motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
