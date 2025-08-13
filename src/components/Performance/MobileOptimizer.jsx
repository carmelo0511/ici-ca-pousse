import React, { useEffect, useRef } from 'react';
import useMobilePerformance from '../../hooks/useMobilePerformance';
import useServiceWorker from '../../hooks/useServiceWorker';

// Composant pour optimiser automatiquement les performances mobiles - Version corrigée
const MobileOptimizer = ({ children }) => {
  const {
    isMobile,
    isLowEndDevice,
    connectionSpeed
  } = useMobilePerformance();
  
  const { isOnline, registerSync } = useServiceWorker();
  const optimizationsApplied = useRef(false);

  // Appliquer les optimisations CSS selon l'appareil
  useEffect(() => {
    if (optimizationsApplied.current) return;

    try {
      const root = document.documentElement;
      
      // Optimisations CSS pour appareils bas de gamme
      if (isLowEndDevice) {
        root.style.setProperty('--animation-duration', '0s');
        root.style.setProperty('--transition-duration', '0s');
        root.classList.add('low-end-device');
      } else {
        root.style.setProperty('--animation-duration', '0.3s');
        root.style.setProperty('--transition-duration', '0.2s');
        root.classList.remove('low-end-device');
      }

      // Optimisations pour réseau lent
      if (connectionSpeed === 'slow') {
        root.classList.add('slow-network');
      } else {
        root.classList.remove('slow-network');
      }

      // Optimisations pour mobile
      if (isMobile) {
        root.classList.add('mobile-device');
        document.body.style.touchAction = 'manipulation';
      }

      optimizationsApplied.current = true;
    } catch (error) {
      console.warn('Erreur lors de l\'application des optimisations:', error);
    }
  }, [isMobile, isLowEndDevice, connectionSpeed]);

  // Synchronisation en arrière-plan quand retour en ligne - Version simplifiée
  useEffect(() => {
    if (isOnline && connectionSpeed !== 'slow') {
      try {
        // Synchroniser les données en attente
        registerSync('sync-user-data');
        registerSync('sync-workouts');
      } catch (error) {
        console.warn('Erreur lors de la synchronisation:', error);
      }
    }
  }, [isOnline, connectionSpeed, registerSync]);

  return (
    <>
      {children}
      {/* Styles CSS injectés pour les optimisations */}
      <style>{`
        .low-end-device * {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
        
        .slow-network img {
          loading: lazy;
        }
        
        .mobile-device {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
        
        .mobile-device * {
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Optimisations de scroll pour mobile */
        @media (max-width: 768px) {
          .mobile-device {
            overscroll-behavior: contain;
          }
          
          .mobile-device .scroll-container {
            -webkit-overflow-scrolling: touch;
            scroll-behavior: smooth;
          }
        }
        
        /* Réduire les animations sur appareils bas de gamme */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        /* Optimisations pour connexions lentes */
        .slow-network .hero-image,
        .slow-network .background-image {
          background-image: none !important;
          background-color: #f3f4f6;
        }
        
        .slow-network .animation-heavy {
          animation: none !important;
        }
      `}</style>
    </>
  );
};

export default MobileOptimizer;