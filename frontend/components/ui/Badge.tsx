import React from 'react';

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'muted';
  className?: string;
  children?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'primary', className = '', children }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-full text-xs font-medium px-2.5 py-1';

    let variantClasses = '';
    switch (variant) {
      case 'primary':
        variantClasses = 'bg-blue-100 text-blue-700';
        break;
      case 'secondary':
        variantClasses = 'bg-gray-100 text-gray-700';
        break;
      case 'success':
        variantClasses = 'bg-green-100 text-green-700';
        break;
      case 'warning':
        variantClasses = 'bg-amber-100 text-amber-700';
        break;
      case 'destructive':
        variantClasses = 'bg-red-100 text-red-700';
        break;
      case 'muted':
        variantClasses = 'bg-gray-100 text-gray-600';
        break;
      default:
        variantClasses = 'bg-blue-100 text-blue-700';
    }

    const classes = `${baseClasses} ${variantClasses} ${className}`.trim();

    return (
      <span ref={ref} className={classes}>
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
