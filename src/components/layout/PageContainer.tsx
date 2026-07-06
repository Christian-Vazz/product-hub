import { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export const PageContainer = ({ title, subtitle, action, children }: PageContainerProps) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>
);
