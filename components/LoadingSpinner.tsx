
import React from 'react';

const LoadingSpinner: React.FC<{ size?: string; color?: string }> = ({ size = 'w-8 h-8', color = 'border-primary' }) => {
  return (
    <div className={`animate-spin rounded-full ${size} border-t-2 border-b-2 ${color}`}></div>
  );
};

export default LoadingSpinner;
