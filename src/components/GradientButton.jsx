import React from 'react';
import PropTypes from 'prop-types';

const GradientButton = ({
  children,
  icon: Icon,
  className = '',
  from = 'blue-500',
  to = 'blue-600',
  onClick,
  type = 'button',
  size = 'md',
  radius = '',
  ariaLabel,
  disabled = false,
  variant = 'primary',
  ...props
}) => {
  // Size classes for fine-tuning if needed (optional)
  const sizeClasses =
    size === 'sm'
      ? 'text-sm'
      : size === 'lg'
        ? 'text-lg'
        : '';

  // Determine button class based on variant
  const getButtonClass = () => {
    if (variant === 'secondary') {
      return 'btn-secondary';
    }
    // Special handling for delete/danger buttons
    if (from === 'red-500' || to === 'red-500' || className.includes('red')) {
      return 'btn-primary'; // Use primary with red styling override
    }
    return 'btn-primary';
  };

  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`${getButtonClass()} ripple-effect flex items-center space-x-3 disabled:opacity-50 ${sizeClasses} ${className}`}
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
  variant: PropTypes.oneOf(['primary', 'secondary']),
};

export default GradientButton;
