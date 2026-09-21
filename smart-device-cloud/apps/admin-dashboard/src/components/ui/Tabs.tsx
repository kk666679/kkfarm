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
  const [selected, setSelected] = React.useState(defaultValue);

  return (
    <div className={className}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(
            child as React.ReactElement<{ value?: string; setValue?: (v: string) => void }>,
            { value: selected, setValue: setSelected }
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
  const isActive = false;
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
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
