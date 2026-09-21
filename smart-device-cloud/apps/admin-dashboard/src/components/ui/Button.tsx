import React from 'react';

export function Button({
  children,
  onClick,
  type,
  variant = 'default',
  size = 'default',
  className = '',
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
  className?: string;
  disabled?: boolean;
}) {
  const base =
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50';
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-slate-700 bg-transparent hover:bg-slate-800',
    ghost: 'hover:bg-slate-800',
  };
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3',
    icon: 'h-10 w-10',
  };
  return (
    <button
      type={type ?? 'button'}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
