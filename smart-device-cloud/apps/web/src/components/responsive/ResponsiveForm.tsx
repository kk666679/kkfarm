import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveFormProps {
  children: ReactNode;
  className?: string;
  onSubmit?: (e: React.FormEvent) => void;
  layout?: 'stack' | 'grid';
}

/**
 * Responsive form wrapper
 * - Stack: Single column on all viewports (default)
 * - Grid: 1 column mobile, 2 columns tablet/desktop
 */
export function ResponsiveForm({
  children,
  className,
  onSubmit,
  layout = 'stack',
}: ResponsiveFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'w-full',
        layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-fluid-4' : 'space-y-fluid-4',
        className
      )}
      noValidate
    >
      {children}
    </form>
  );
}

interface ResponsiveFormGroupProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

/**
 * Form group with responsive spacing
 * fullWidth: span across all columns on grid layout
 */
export function ResponsiveFormGroup({
  children,
  className,
  fullWidth = false,
}: ResponsiveFormGroupProps) {
  return (
    <div className={cn('space-y-fluid-2', fullWidth && 'md:col-span-2', className)}>{children}</div>
  );
}

interface ResponsiveFormLabelProps {
  children: ReactNode;
  className?: string;
  htmlFor?: string;
  required?: boolean;
}

export function ResponsiveFormLabel({
  children,
  className,
  htmlFor,
  required = false,
}: ResponsiveFormLabelProps) {
  return (
    <label htmlFor={htmlFor} className={cn('block text-sm font-medium text-foreground', className)}>
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
  );
}

interface ResponsiveFormControlProps {
  children: ReactNode;
  className?: string;
  error?: string;
  helperText?: string;
  errorId?: string;
  helperId?: string;
}

export function ResponsiveFormControl({
  children,
  className,
  error,
  helperText,
  errorId,
  helperId,
}: ResponsiveFormControlProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {children}
      {error && (
        <p id={errorId} className="text-xs text-destructive font-medium" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}

interface ResponsiveFormActionsProps {
  children: ReactNode;
  className?: string;
  layout?: 'row' | 'col' | 'responsive';
  fullWidth?: boolean;
}

/**
 * Form actions wrapper
 * responsive: stacks on mobile, rows on desktop
 */
export function ResponsiveFormActions({
  children,
  className,
  layout = 'responsive',
  fullWidth = false,
}: ResponsiveFormActionsProps) {
  const layoutMap = {
    row: 'flex flex-row gap-fluid-3',
    col: 'flex flex-col gap-fluid-2',
    responsive: 'flex flex-col sm:flex-row gap-fluid-2 sm:gap-fluid-3',
  };

  return (
    <div className={cn(layoutMap[layout], fullWidth && 'md:col-span-2', 'mt-fluid-4', className)}>
      {children}
    </div>
  );
}
