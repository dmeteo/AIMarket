import React from 'react';

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'muted';
  className?: string;
  children?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'primary',
      className = '',
      children,
    },
    ref
  ) => {
    // Base classes
    const baseClasses = 'inline-flex items-center justify-center rounded-text text-xs font-medium uppercase tracking-wider';

    // Variant classes
    let variantClasses = '';
    switch (variant) {
      case 'primary':
        variantClasses = 'bg-primary-muted text-primary';
        break;
      case 'secondary':
        variantClasses = 'bg-background-muted text-text-primary';
        break;
      case 'success':
        variantClasses = 'bg-success-muted text-success';
        break;
      case 'warning':
        variantClasses = 'bg-warning-muted text-warning';
        break;
      case 'destructive':
        variantClasses = 'bg-destructive-muted text-destructive';
        break;
      case 'muted':
        variantClasses = 'bg-background-muted text-muted';
        break;
      default:
        variantClasses = 'bg-primary-muted text-primary';
    }

    // Combine all classes
    const classes = `${baseClasses} ${variantClasses} ${className}`.trim();

    return (
      <span
        ref={ref}
        className={classes}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;