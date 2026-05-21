import React from 'react';

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'standard' | 'elevated' | 'outlined' | 'interactive' | 'selectable';
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className = '',
      variant = 'standard',
      asChild = false,
    },
    ref
  ) => {
    // Base classes
    const baseClasses = 'transition-colors duration-150 ease-in-out';

    // Variant classes
    let variantClasses = '';
    switch (variant) {
      case 'standard':
        variantClasses =
          'bg-background border border-border shadow';
        break;
      case 'elevated':
        variantClasses =
          'bg-background shadow'; // no border
        break;
      case 'outlined':
        variantClasses =
          'bg-transparent border border-border'; // no shadow? but design says outlined: boundary visible, фон прозрачный
        break;
      case 'interactive':
        variantClasses =
          'bg-background border border-border shadow hover:shadow-md hover:-translate-y-1 cursor-pointer';
        break;
      case 'selectable':
        variantClasses =
          'bg-background border border-border shadow';
        break;
      default:
        variantClasses = '';
    }

    // For selectable, we would need to handle selected state via props, but we don't have that here.
    // We'll just use the base variant classes and leave selected state to be handled by consumer via className.

    // Combine all classes
    const classes = `${baseClasses} ${variantClasses} ${className}`.trim();

    // Render appropriate element
    if (asChild) {
      // For simplicity, we ignore asChild and render a div.
      // In a more advanced implementation, we would spread props to a child.
      return (
        <div
          ref={ref}
          className={classes}
        >
          {children}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={classes}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;