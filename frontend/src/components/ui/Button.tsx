import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'destructive' | 'success' | 'warning' | 'link';
  size?: 'sm' | 'base' | 'lg' | 'icon';
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  asChild?: boolean;
  iconOnly?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'base',
      className = '',
      disabled = false,
      loading = false,
      onClick,
      asChild = false,
      iconOnly = false,
      children,
    },
    ref
  ) => {
    // Base classes
    const baseClasses = 'transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    // Variant classes
    let variantClasses = '';
    switch (variant) {
      case 'primary':
        variantClasses =
          'bg-primary text-text-on-primary hover:bg-primary-hover active:bg-primary-active';
        break;
      case 'secondary':
        variantClasses =
          'bg-background-muted text-text-primary border border-border hover:bg-hover';
        break;
      case 'destructive':
        variantClasses =
          'bg-destructive text-text-on-primary hover:bg-destructive-hover';
        break;
      case 'success':
        variantClasses =
          'bg-success text-text-on-primary hover:bg-success-hover';
        break;
      case 'warning':
        variantClasses =
          'bg-warning text-text-on-primary hover:bg-warning-hover';
        break;
      case 'link':
        variantClasses =
          'text-primary hover:underline';
        break;
      default:
        variantClasses = '';
    }

    // Size classes
    let sizeClasses = '';
    switch (size) {
      case 'sm':
        sizeClasses = 'px-3 py-1.5 text-xs';
        break;
      case 'base':
        sizeClasses = 'px-4 py-2 text-sm';
        break;
      case 'lg':
        sizeClasses = 'px-5 py-2.5 text-base';
        break;
      case 'icon':
        sizeClasses = 'h-10 w-10'; // 40x40
        break;
      default:
        sizeClasses = '';
    }

    // Icon-only adjustments
    const iconOnlyClasses = iconOnly ? 'flex items-center justify-center' : '';

    // Loading state
    const loadingClasses = loading
      ? 'pointer-events-none'
      : '';

    // Combine all classes
    const classes = `${baseClasses} ${variantClasses} ${sizeClasses} ${iconOnlyClasses} ${loadingClasses} ${className}`.trim();

    // Render appropriate element
    if (asChild) {
      // When asChild is true, we render the children with props
      // This is useful for wrapping a button around an image or other element
      // For simplicity, we'll just return a button and let the consumer handle asChild via composition
      // In a real implementation, we would use the slot pattern or render the child with props
      // For now, we ignore asChild and render a button
      return (
        <button
          ref={ref}
          className={classes}
          disabled={disabled || loading}
          onClick={onClick}
        >
          {loading ? (
            <span className="sr-only">Loading...</span>
          ) : (
            <>
              {children}
            </>
          )}
        </button>
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        onClick={onClick}
      >
        {loading ? (
          <span className="sr-only">Loading...</span>
        ) : (
          <>
            {children}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;