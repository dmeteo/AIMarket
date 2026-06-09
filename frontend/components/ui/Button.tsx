import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'success' | 'warning' | 'link';
  size?: 'sm' | 'base' | 'lg' | 'icon';
  loading?: boolean;
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
      iconOnly = false,
      children,
      ...rest
    },
    ref
  ) => {
    const gapClass = iconOnly ? '' : 'gap-2';
    const baseClasses =
      `inline-flex items-center justify-center ${gapClass} transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-md hover:opacity-90 active:scale-95 font-medium cursor-pointer`;

    let variantClasses = '';
    switch (variant) {
      case 'primary':
        variantClasses = 'bg-gray-900 text-white hover:bg-gray-800';
        break;
      case 'secondary':
        variantClasses = 'bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200';
        break;
      case 'destructive':
        variantClasses = 'bg-red-600 text-white hover:bg-red-700';
        break;
      case 'success':
        variantClasses = 'bg-green-600 text-white hover:bg-green-700';
        break;
      case 'warning':
        variantClasses = 'bg-amber-500 text-white hover:bg-amber-600';
        break;
      case 'link':
        variantClasses = 'text-blue-600 hover:underline bg-transparent shadow-none';
        break;
    }

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
        sizeClasses = 'h-10 w-10';
        break;
    }

    const classes = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim();

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
