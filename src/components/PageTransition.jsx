import React from 'react';

const PageTransition = ({ children, isActive, className = "" }) => {
  return (
    <div 
      className={`w-full transition-all duration-300 ease-in-out ${
        isActive 
          ? 'opacity-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 translate-y-4 pointer-events-none absolute inset-0'
      } ${className}`}
      style={{
        display: isActive ? 'block' : 'none'
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition; 