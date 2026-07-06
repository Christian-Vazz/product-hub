import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface NexusBadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variants: Record<string, string> = {
  default: 'bg-secondary text-secondary-foreground',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-destructive/10 text-destructive',
  info: 'bg-info/10 text-info',
};

export const NexusBadge = ({ children, variant = 'default', className }: NexusBadgeProps) => (
  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
    {children}
  </span>
);
