import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const AnimatedTitle = ({ 
  children, 
  className = '', 
  variant = '3d',
  showIcon = true,
  size = 'md' 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const sizeClasses = {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-lg md:text-xl',
    lg: 'text-lg sm:text-xl md:text-2xl lg:text-3xl'
  };

  const iconSizeClasses = {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-lg md:text-xl',
    lg: 'text-lg sm:text-xl md:text-2xl'
  };

  // Variant 1: Titre 3D avec effet de profondeur
  const render3DVariant = () => (
    <div 
      className={`relative inline-block ${sizeClasses[size]} font-extrabold cursor-pointer transition-all duration-300 ${
        isHovered ? 'scale-105' : 'scale-100'
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'perspective(1000px) rotateX(10deg) rotateY(5deg)' : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Ombre portée 3D */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-gray-800/30 to-transparent rounded-lg blur-sm"
        style={{
          transform: 'translateZ(-10px)',
          filter: 'blur(2px)'
        }}
      />
      
      {/* Texte principal avec gradient animé */}
      <div className="relative">
        <span 
          className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
          style={{
            backgroundSize: '200% 200%',
            animation: 'gradientShift 3s ease infinite'
          }}
        >
          {children}
        </span>
        
        {/* Effet de brillance */}
        <div 
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent ${
            isHovered ? 'animate-shine' : ''
          }`}
          style={{
            transform: 'translateX(-100%)',
            transition: 'transform 0.6s ease-in-out'
          }}
        />
      </div>

      {/* Icône animée */}
      {showIcon && (
        <span 
          className={`inline-block ml-2 ${iconSizeClasses[size]} transition-all duration-300 ${
            isHovered ? 'animate-bounce rotate-12' : 'animate-pulse'
          }`}
          style={{
            transform: isHovered ? 'rotateY(180deg) scale(1.2)' : 'rotateY(0deg) scale(1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          💪
        </span>
      )}
    </div>
  );

  // Variant 2: Titre avec effet de particules
  const renderParticleVariant = () => (
    <div className={`relative inline-block ${sizeClasses[size]} font-extrabold ${className}`}>
      {/* Particules en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>
      
      {/* Texte principal */}
      <span className="relative bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        {children}
      </span>
      
      {/* Icône */}
      {showIcon && (
        <span className={`inline-block ml-2 ${iconSizeClasses[size]} animate-pulse`}>
          💪
        </span>
      )}
    </div>
  );

  // Variant 3: Titre avec effet de typing
  const renderTypingVariant = () => (
    <div className={`inline-block ${sizeClasses[size]} font-extrabold ${className}`}>
      <span 
        className={`bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent ${
          isLoaded ? 'animate-typing' : 'opacity-0'
        }`}
        style={{
          borderRight: isLoaded ? '2px solid #6366f1' : 'none',
          animation: isLoaded ? 'typing 2s steps(20, end), blink-caret 0.75s step-end infinite' : 'none'
        }}
      >
        {children}
      </span>
      
      {/* Icône */}
      {showIcon && (
        <span 
          className={`inline-block ml-2 ${iconSizeClasses[size]} ${
            isLoaded ? 'animate-fadeInUp' : 'opacity-0'
          }`}
          style={{
            animationDelay: '1.5s',
            animationFillMode: 'both'
          }}
        >
          💪
        </span>
      )}
    </div>
  );

  // Sélection du variant
  const renderVariant = () => {
    switch (variant) {
      case '3d':
        return render3DVariant();
      case 'particles':
        return renderParticleVariant();
      case 'typing':
        return renderTypingVariant();
      default:
        return render3DVariant();
    }
  };

  return (
    <>
      {renderVariant()}
      
      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }
        
        @keyframes blink-caret {
          from, to { border-color: transparent; }
          50% { border-color: #6366f1; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-shine {
          animation: shine 0.6s ease-in-out;
        }
        
        .animate-typing {
          animation: typing 2s steps(20, end), blink-caret 0.75s step-end infinite;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
        }
      `}</style>
    </>
  );
};

AnimatedTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['3d', 'particles', 'typing']),
  showIcon: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
};

export default AnimatedTitle;
