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
  radius = 'rounded-xl',
  ariaLabel,
  disabled = false,
  ...props
}) => {
  const sizeClasses =
    size === 'sm'
      ? 'px-3 py-2 text-sm'
      : size === 'lg'
        ? 'px-8 py-4 text-lg'
        : 'px-6 py-3';

  // Mapping des couleurs pour les gradients - tous en bleu sauf rouge pour suppression
  const getGradientClasses = (fromColor, toColor) => {
    // Si les couleurs sont directement blue-500 et blue-600, les utiliser
    if (fromColor === 'blue-500' && toColor === 'blue-600') {
      return 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700';
    }

    const gradients = {
      'blue-400-indigo-500':
        'bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600',
      'red-500-pink-600':
        'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700',
      'purple-500-violet-600':
        'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      'rose-500-pink-600':
        'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      'emerald-500-teal-600':
        'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      'orange-500-amber-600':
        'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      'gray-100-gray-200':
        'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300',
      'indigo-500-purple-600':
        'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    };

    const key = `${fromColor}-${toColor}`;
    return (
      gradients[key] ||
      'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
    );
  };

  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`${getGradientClasses(from, to)} text-white ${sizeClasses} ${radius} flex items-center space-x-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 border border-white/20 ${className}`}
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
