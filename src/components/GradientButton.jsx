import React from 'react';

const GradientButton = ({ children, icon: Icon, className = '', from = 'indigo-500', to = 'purple-600', onClick, type = 'button', ...props }) => (
  <button
    type={type}
    onClick={onClick}
    className={`bg-gradient-to-r from-${from} to-${to} hover:from-${from.replace('500','600')} hover:to-${to.replace('600','700')} text-white px-6 py-3 rounded-xl flex items-center space-x-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
    {...props}
  >
    {Icon && <Icon className="h-5 w-5" />}
    <span>{children}</span>
  </button>
);

export default GradientButton; 