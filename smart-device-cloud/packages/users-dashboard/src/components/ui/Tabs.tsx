import React from 'react';

export function Tabs({
  defaultValue,
  children,
  className = '',
}: {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [value, setValue] = React.useState(defaultValue);

  return (
    <div className={className}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(
            child as React.ReactElement<{ value?: string; setValue?: (v: string) => void }>,
            { value, setValue }
          );
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center rounded-lg bg-slate-800 p-1 ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  setValue,
  className = '',
}: {
  value: string;
  children: React.ReactNode;
  setValue?: (v: string) => void;
  className?: string;
}) {
  const isActive = value === value;
  return (
    <button
      onClick={() => setValue?.(value)}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'} ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  children,
  className = '',
}: {
  value?: string;
  children: React.ReactNode;
  className?: string;
}) {
  // This component is rendered by parent Tabs context; for simplicity render directly if matched
  return <div className={className}>{children}</div>;
}
