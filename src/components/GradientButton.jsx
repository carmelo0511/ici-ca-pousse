import React from 'react';
import PropTypes from 'prop-types';

const GradientButton = ({
  children,
  icon: Icon,
  className = '',
  from = 'indigo-500',
  to = 'purple-600',
  onClick,
  type = 'button',
  size = 'md',
  radius = 'rounded-xl',
  ariaLabel,
  disabled = false,
  ...props
}) => {
  const sizeClasses = size === 'sm' ? 'px-3 py-2 text-sm' : size === 'lg' ? 'px-8 py-4 text-lg' : 'px-6 py-3';
  
  // Mapping des couleurs pour les gradients
  const getGradientClasses = (fromColor, toColor) => {
    const gradients = {
      'blue-400-indigo-500': 'bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600',
      'red-500-pink-600': 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700',
      'purple-500-violet-600': 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700',
      'rose-500-pink-600': 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700',
      'emerald-500-teal-600': 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700',
      'orange-500-amber-600': 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700',
      'gray-100-gray-200': 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300',
      'indigo-500-purple-600': 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700',
    };
    
    const key = `${fromColor}-${toColor}`;
    return gradients[key] || gradients['indigo-500-purple-600'];
  };

  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`${getGradientClasses(from, to)} text-white ${sizeClasses} ${radius} flex items-center space-x-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 ${className}`}
      {...props}
    >
      {Icon && <Icon className="h-5 w-5" />}
      <span>{children}</span>
    </button>
  );
};

GradientButton.propTypes = {
  children: PropTypes.node.isRequired,
  icon: PropTypes.elementType,
  className: PropTypes.string,
  from: PropTypes.string,
  to: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  radius: PropTypes.string,
  ariaLabel: PropTypes.string,
  disabled: PropTypes.bool,
};

export default GradientButton; 