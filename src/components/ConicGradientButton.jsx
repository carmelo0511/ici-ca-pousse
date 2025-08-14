import React from 'react';
import PropTypes from 'prop-types';

const ConicGradientButton = ({
  children,
  icon: Icon,
  className = '',
  onClick,
  type = 'button',
  size = 'md',
  disabled = false,
  variant = 'primary',
  ...props
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  // Variant styles - style glassmorphe harmonisé avec l'app
  const variantStyles = {
    primary: {
      background: 'rgba(59, 130, 246, 0.1)',
      hoverBackground: 'rgba(59, 130, 246, 0.2)',
      textColor: 'text-blue-600',
      shadow: 'shadow-sm hover:shadow-md',
      backdrop: 'backdrop-blur-sm'
    },
    secondary: {
      background: 'rgba(16, 185, 129, 0.1)',
      hoverBackground: 'rgba(16, 185, 129, 0.2)',
      textColor: 'text-emerald-600',
      shadow: 'shadow-sm hover:shadow-md',
      backdrop: 'backdrop-blur-sm'
    },
    danger: {
      background: 'rgba(239, 68, 68, 0.1)',
      hoverBackground: 'rgba(239, 68, 68, 0.2)',
      textColor: 'text-red-600',
      shadow: 'shadow-sm hover:shadow-md',
      backdrop: 'backdrop-blur-sm'
    }
  };

  const currentVariant = variantStyles[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden rounded-lg font-medium transition-all duration-200 
        ${sizeClasses[size]} 
        ${currentVariant.textColor} 
        ${currentVariant.shadow}
        ${currentVariant.backdrop}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
        ${className}
      `}
      style={{
        background: currentVariant.background
      }}
      {...props}
    >
      {/* Hover overlay */}
      <div 
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200"
        style={{
          background: currentVariant.hoverBackground
        }}
      />
      
      {/* Content */}
      <div className="relative flex items-center justify-center gap-2">
        {Icon && <Icon className="h-4 w-4" />}
        <span className="text-sm font-medium">{children}</span>
      </div>
    </button>
  );
};

ConicGradientButton.propTypes = {
  children: PropTypes.node.isRequired,
  icon: PropTypes.elementType,
  className: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
};

export default ConicGradientButton;
