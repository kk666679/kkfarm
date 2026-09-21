import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'default', size = 'default', className = '', ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50';
    const variants = {
      default: 'bg-blue-600 text-white hover:bg-blue-700',
      outline: 'border border-slate-700 bg-transparent hover:bg-slate-800',
      ghost: 'hover:bg-slate-800',
    };
    const sizes = { default: 'h-10 px-4 py-2', sm: 'h-9 px-3', icon: 'h-10 w-10' };
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
