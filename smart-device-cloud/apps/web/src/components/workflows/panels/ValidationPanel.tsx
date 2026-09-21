'use client';
import { AlertTriangle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ValidationIssue } from '../types';

export interface ValidationPanelProps {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export function ValidationPanel({ errors, warnings }: ValidationPanelProps) {
  if (errors.length === 0 && warnings.length === 0) return null;
  return (
    <Card
      className={cn(
        'max-w-sm border-border bg-card p-3 shadow-lg',
        errors.length > 0 && 'border-destructive/50'
      )}
    >
      <div className="space-y-2">
        {errors.length > 0 && (
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <XCircle className="h-3.5 w-3.5 text-destructive" />
              <span className="text-xs font-semibold text-destructive">
                {errors.length} error{errors.length === 1 ? '' : 's'}
              </span>
            </div>
            <ul className="space-y-1 pl-5 text-[11px]">
              {errors.slice(0, 5).map((issue, i) => (
                <li key={i} className="list-disc text-muted-foreground">
                  {issue.message}
                </li>
              ))}
              {errors.length > 5 && (
                <li className="list-disc text-muted-foreground">+{errors.length - 5} more</li>
              )}
            </ul>
          </div>
        )}
        {warnings.length > 0 && (
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-amber-500">
                {warnings.length} warning{warnings.length === 1 ? '' : 's'}
              </span>
            </div>
            <ul className="space-y-1 pl-5 text-[11px]">
              {warnings.slice(0, 3).map((issue, i) => (
                <li key={i} className="list-disc text-muted-foreground">
                  {issue.message}
                </li>
              ))}
              {warnings.length > 3 && (
                <li className="list-disc text-muted-foreground">+{warnings.length - 3} more</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
