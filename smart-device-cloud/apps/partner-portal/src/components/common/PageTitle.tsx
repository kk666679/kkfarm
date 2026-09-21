import { ReactNode } from 'react';

interface PageTitleProps {
  title: string;
  description?: string;
  subtitle?: string;
  children?: ReactNode;
}

export function PageTitle({ title, description, subtitle, children }: PageTitleProps) {
  const sub = subtitle ?? description;
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {sub && <p className="text-muted-foreground mt-1">{sub}</p>}
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}
