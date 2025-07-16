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
  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`bg-gradient-to-r from-${from} to-${to} hover:from-${from.replace('500','600')} hover:to-${to.replace('600','700')} text-white ${sizeClasses} ${radius} flex items-center space-x-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 ${className}`}
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