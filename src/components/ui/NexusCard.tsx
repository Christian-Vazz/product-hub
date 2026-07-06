import { ReactNode } from 'react';

interface NexusCardProps {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
  className?: string;
}

export const NexusCard = ({ children, title, action, className = '' }: NexusCardProps) => (
  <div className={`nexus-card ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        {title && <h3 className="font-semibold text-card-foreground">{title}</h3>}
        {action}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);
