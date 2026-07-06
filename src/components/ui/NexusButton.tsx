import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface NexusButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles: Record<string, string> = {
  primary: 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm',
  secondary: 'bg-card text-foreground border border-border hover:bg-secondary shadow-sm',
  danger: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
  ghost: 'bg-transparent text-muted-foreground hover:bg-secondary',
  success: 'bg-success text-success-foreground hover:opacity-90 shadow-sm',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const NexusButton = ({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: NexusButtonProps) => (
  <button
    className={cn(
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none',
      variantStyles[variant],
      sizeStyles[size],
      className
    )}
    {...props}
  />
);
