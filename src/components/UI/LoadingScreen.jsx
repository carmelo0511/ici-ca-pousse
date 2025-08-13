import React, { memo } from 'react';
import PropTypes from 'prop-types';

// Composant de chargement optimisé avec mémorisation
const LoadingScreen = memo(({ message = "Chargement...", size = "medium", className = "" }) => {
  const sizeClasses = {
    small: "text-sm",
    medium: "text-base", 
    large: "text-lg"
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      {/* Spinner optimisé pour mobile */}
      <div className="relative mb-4">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
      
      {/* Message de chargement */}
      <p className={`text-gray-600 ${sizeClasses[size]} text-center`}>
        {message}
      </p>
    </div>
  );
});

LoadingScreen.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string
};

LoadingScreen.displayName = 'LoadingScreen';

export default LoadingScreen;