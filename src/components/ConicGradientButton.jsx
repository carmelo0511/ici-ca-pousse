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

  // Variant styles
  const variantStyles = {
    primary: {
      background: 'conic-gradient(from 180deg at 50% 50%, #667eea 0deg, #764ba2 180deg, #667eea 360deg)',
      hoverBackground: 'conic-gradient(from 180deg at 50% 50%, #5a67d8 0deg, #6b46c1 180deg, #5a67d8 360deg)',
      textColor: 'text-white',
      shadow: 'shadow-lg hover:shadow-xl'
    },
    secondary: {
      background: 'conic-gradient(from 180deg at 50% 50%, #48bb78 0deg, #38a169 180deg, #48bb78 360deg)',
      hoverBackground: 'conic-gradient(from 180deg at 50% 50%, #38a169 0deg, #2f855a 180deg, #38a169 360deg)',
      textColor: 'text-white',
      shadow: 'shadow-lg hover:shadow-xl'
    },
    danger: {
      background: 'conic-gradient(from 180deg at 50% 50%, #f56565 0deg, #e53e3e 180deg, #f56565 360deg)',
      hoverBackground: 'conic-gradient(from 180deg at 50% 50%, #e53e3e 0deg, #c53030 180deg, #e53e3e 360deg)',
      textColor: 'text-white',
      shadow: 'shadow-lg hover:shadow-xl'
    }
  };

  const currentVariant = variantStyles[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden rounded-xl font-semibold transition-all duration-300 
        ${sizeClasses[size]} 
        ${currentVariant.textColor} 
        ${currentVariant.shadow}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
        ${className}
      `}
      style={{
        background: disabled ? currentVariant.background : currentVariant.background,
        backgroundSize: '200% 200%',
        animation: disabled ? 'none' : 'gradientShift 3s ease infinite'
      }}
      {...props}
    >
      {/* Animated background overlay */}
      <div 
        className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-300"
        style={{
          background: currentVariant.hoverBackground,
          backgroundSize: '200% 200%'
        }}
      />
      
      {/* Content */}
      <div className="relative flex items-center justify-center gap-2">
        {Icon && <Icon className="h-5 w-5" />}
        <span>{children}</span>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
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
