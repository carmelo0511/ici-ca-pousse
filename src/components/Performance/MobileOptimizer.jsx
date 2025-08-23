import React, { useEffect, useRef } from 'react';

/**
 * Composant d'optimisation mobile pour améliorer les performances
 * et réduire le Cumulative Layout Shift (CLS)
 */
const MobileOptimizer = ({ children }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Optimisations pour mobile
    const optimizeForMobile = () => {
      // Réduire les animations sur mobile
      if (window.innerWidth <= 768) {
        document.documentElement.style.setProperty('--animation-duration', '0.2s');
        document.documentElement.style.setProperty('--transition-duration', '0.2s');
      }

      // Prévenir le zoom sur iOS
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport && window.innerWidth <= 768) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
      }

      // Optimiser les images
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.complete) {
          img.style.opacity = '0';
          img.onload = () => {
            img.style.opacity = '1';
            img.style.transition = 'opacity 0.3s ease';
          };
        }
      });

      // Réduire la complexité des animations
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion || window.innerWidth <= 768) {
        document.documentElement.classList.add('reduced-motion');
      }
    };

    // Optimisations pour les interactions
    const optimizeInteractions = () => {
      // Améliorer la réactivité des boutons
      const buttons = document.querySelectorAll('button, [role="button"]');
      buttons.forEach(button => {
        button.style.touchAction = 'manipulation';
        button.style.webkitTapHighlightColor = 'transparent';
      });

      // Optimiser les inputs
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.style.fontSize = '16px'; // Éviter le zoom sur iOS
        input.style.transform = 'translateZ(0)'; // Force GPU acceleration
      });
    };

    // Optimisations pour le scroll
    const optimizeScroll = () => {
      // Améliorer le scroll sur mobile
      document.documentElement.style.scrollBehavior = 'smooth';
      
      // Réduire la complexité du scroll sur mobile
      if (window.innerWidth <= 768) {
        document.documentElement.style.overscrollBehavior = 'contain';
      }
    };

    // Appliquer les optimisations
    optimizeForMobile();
    optimizeInteractions();
    optimizeScroll();

    // Réappliquer lors du redimensionnement
    const handleResize = () => {
      optimizeForMobile();
      optimizeInteractions();
      optimizeScroll();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="mobile-optimizer"
      style={{
        minHeight: '100vh',
        width: '100%',
        overflowX: 'hidden',
        position: 'relative'
      }}
    >
      {children}
    </div>
  );
};

export default MobileOptimizer;