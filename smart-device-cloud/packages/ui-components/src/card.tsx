import React from 'react';

export interface CardHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps): React.ReactElement {
  return React.createElement('div', { className: `px-6 py-4 ${className}` }, children);
}

export interface CardTitleProps {
  children?: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps): React.ReactElement {
  return React.createElement('h3', { className: `text-lg font-semibold ${className}` }, children);
}

export interface CardContentProps {
  children?: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps): React.ReactElement {
  return React.createElement('div', { className: `px-6 py-4 ${className}` }, children);
}
