import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  inputSize?: 'sm' | 'base' | 'lg';
  variant?: 'standard' | 'underlined' | 'flipped' | 'search';
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      className = '',
      disabled = false,
      inputSize = 'base',
      variant = 'standard',
      icon,
      ...rest
    },
    ref
  ) => {
    const baseClasses =
      'transition-colors duration-150 ease-in-out focus:outline-none disabled:pointer-events-none disabled:opacity-50 rounded-md w-full';

    let variantClasses = '';
    switch (variant) {
      case 'standard':
        variantClasses = 'bg-white border border-gray-300';
        break;
      case 'underlined':
        variantClasses = 'bg-transparent border-b border-gray-300 rounded-none';
        break;
      case 'flipped':
        variantClasses = 'bg-gray-50 border border-gray-300';
        break;
      case 'search':
        variantClasses = 'bg-white border border-gray-300 pl-10';
        break;
    }

    const sizeConfig = () => {
      switch (inputSize) {
        case 'sm': return { height: 'h-10', padding: 'px-3 py-2' };
        case 'base': return { height: 'h-12', padding: 'px-3 py-2' };
        case 'lg': return { height: 'h-14', padding: 'px-4 py-2' };
        default: return { height: 'h-12', padding: 'px-3 py-2' };
      }
    };
    const { height: heightClasses, padding: paddingClasses } = sizeConfig();

    const focusClasses = 'focus:border-blue-500 focus:ring-2 focus:ring-blue-200';
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

    const inputClasses = `${baseClasses} ${variantClasses} ${focusClasses} ${disabledClasses} ${heightClasses} ${paddingClasses}`.trim();

    return (
      <div className={`relative ${className}`}>
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          disabled={disabled}
          {...rest}
        />
        {variant === 'search' && icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none">
            {icon}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
