import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', disabled = false, error, ...rest }, ref) => {
    const baseClasses =
      'transition-colors duration-150 ease-in-out focus:outline-none disabled:pointer-events-none disabled:opacity-50 rounded-md w-full resize-none';

    const variantClasses = error
      ? 'bg-white border border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
      : 'bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200';

    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

    const textareaClasses = `${baseClasses} ${variantClasses} ${disabledClasses} px-3 py-2`.trim();

    return (
      <div className={className}>
        <textarea
          ref={ref}
          className={textareaClasses}
          disabled={disabled}
          rows={3}
          {...rest}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
