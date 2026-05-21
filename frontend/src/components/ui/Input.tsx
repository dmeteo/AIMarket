import React from 'react';

interface InputProps {
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  readingOnly?: boolean;
  size?: 'sm' | 'base' | 'lg';
  variant?: 'standard' | 'underlined' | 'flipped' | 'search';
  icon?: React.ReactNode; // for search or leading/trailing icon
  asChild?: boolean; // if true, we spread props to the child element (not implemented for simplicity)
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      value = '',
      onChange,
      placeholder = '',
      className = '',
      disabled = false,
      readingOnly = false,
      size = 'base',
      variant = 'standard',
      icon,
      asChild = false,
    },
    ref
  ) => {
    // Base classes
    const baseClasses = 'transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    // Variant classes
    let variantClasses = '';
    switch (variant) {
      case 'standard':
        variantClasses =
          'bg-background border border-border';
        break;
      case 'underlined':
        variantClasses =
          'bg-transparent border-b border-border';
        break;
      case 'flipped':
        variantClasses =
          'bg-background-muted border border-border';
        break;
      case 'search':
        variantClasses =
          'bg-background border border-border pl-10'; // extra left padding for icon
        break;
      default:
        variantClasses = '';
    }

    // Size classes
    let sizeClasses = '';
    let heightClasses = '';
    let paddingClasses = '';
    switch (size) {
      case 'sm':
        heightClasses = 'h-10'; // 40px
        paddingClasses = 'px-3 py-2'; // 12x8
        break;
      case 'base':
        heightClasses = 'h-12'; // 48px
        paddingClasses = 'px-3 py-2'; // 12x8
        break;
      case 'lg':
        heightClasses = 'h-14'; // 56px
        paddingClasses = 'px-4 py-2'; // 16x8
        break;
      default:
        heightClasses = 'h-12';
        paddingClasses = 'px-3 py-2';
    }

    // Icon adjustments (for search variant)
    let iconClasses = '';
    if (variant === 'search' && icon) {
      iconClasses = 'absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted';
    }

    // Focus ring and border color
    const focusClasses =
      'focus:border-primary focus:ring-primary-muted';

    // Disabled and read-only styles
    const disabledClasses = disabled
      ? 'opacity-50 cursor-not-allowed'
      : '';

    // Read-only style (similar to disabled but without cursor change?)
    const readOnlyClasses = readingOnly
      ? 'bg-background-muted cursor-not-allowed'
      : '';

    // Combine all classes
    const classes = `${baseClasses} ${variantClasses} ${focusClasses} ${disabledClasses} ${readOnlyClasses} ${sizeClasses} ${heightClasses} ${paddingClasses} ${iconClasses} ${className}`.trim();

    // Render appropriate element
    if (asChild) {
      // For simplicity, we ignore asChild and render an input.
      // In a more advanced implementation, we would spread props to a child.
      return (
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={classes}
          disabled={disabled}
          readOnly={readingOnly}
        />
      );
    }

    return (
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={classes}
        disabled={disabled}
        readOnly={readingOnly}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;