import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
  className?: string;
}

const variantClasses = {
  default: 'bg-surface-alt text-text-secondary border-border-light',
  primary: 'bg-primary-soft text-primary border-primary/20',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  info: 'bg-accent-cool/10 text-accent-cool border-accent-cool/20',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 text-xs font-medium
        rounded-pill border font-mono
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
