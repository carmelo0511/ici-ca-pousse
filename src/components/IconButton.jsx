import React from 'react';

const IconButton = ({ icon: Icon, className = '', onClick, title, ...props }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-lg flex items-center justify-center transition-all duration-200 ${className}`}
    title={title}
    {...props}
  >
    {Icon && <Icon className="h-5 w-5" />}
  </button>
);

export default IconButton; 