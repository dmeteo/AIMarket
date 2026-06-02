import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      size = 'md',
      className = '',
    },
    ref
  ) => {
    const sizeToClass = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
    };

    const classes = `animate-spin rounded-full border-2 border-solid border-current border-t-transparent ${sizeToClass[size]} ${className}`;

    return (
      <div
        ref={ref}
        className={classes}
        aria-label="Loading"
      />
    );
  }
);

Spinner.displayName = 'Spinner';

export default Spinner;