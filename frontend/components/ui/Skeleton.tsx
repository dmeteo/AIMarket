import React from 'react';

const Skeleton = ({ className = '', ...props }) => {
  return <div className={`animate-pulse bg-background-muted ${className}`} {...props} />;
};

export default Skeleton;