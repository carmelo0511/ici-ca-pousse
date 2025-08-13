import { useState, useEffect, useCallback, useMemo } from 'react';

// Hook pour optimiser les performances mobiles
export const useMobilePerformance = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [connectionSpeed, setConnectionSpeed] = useState('fast');

  // Détection du type d'appareil
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      setIsMobile(isMobileDevice);

      // Détection des appareils bas de gamme
      const memory = navigator.deviceMemory || 4; // GB
      const cores = navigator.hardwareConcurrency || 4;
      const isLowEnd = memory < 4 || cores < 4;
      setIsLowEndDevice(isLowEnd);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Détection de la vitesse de connexion
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      const updateConnectionSpeed = () => {
        const effectiveType = connection.effectiveType || '4g';
        const downlink = connection.downlink || 10;
        
        if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1) {
          setConnectionSpeed('slow');
        } else if (effectiveType === '3g' || downlink < 5) {
          setConnectionSpeed('medium');
        } else {
          setConnectionSpeed('fast');
        }
      };

      updateConnectionSpeed();
      connection.addEventListener('change', updateConnectionSpeed);
      return () => connection.removeEventListener('change', updateConnectionSpeed);
    }
  }, []);

  // Optimisations basées sur l'appareil
  const optimizations = useMemo(() => ({
    // Réduire la qualité des images sur mobile
    imageQuality: isMobile ? 'medium' : 'high',
    
    // Limiter les animations sur appareils bas de gamme
    enableAnimations: !isLowEndDevice,
    
    // Réduire la fréquence de mise à jour
    updateFrequency: isLowEndDevice ? 'low' : 'normal',
    
    // Lazy loading plus agressif sur connexion lente
    lazyLoadingThreshold: connectionSpeed === 'slow' ? 0 : 100,
    
    // Réduire la complexité des calculs
    enableComplexCalculations: !isLowEndDevice && connectionSpeed !== 'slow',
    
    // Cache plus agressif
    cacheStrategy: isLowEndDevice ? 'aggressive' : 'normal'
  }), [isMobile, isLowEndDevice, connectionSpeed]);

  // Fonction pour retarder les calculs lourds
  const deferHeavyCalculation = useCallback((callback, delay = 100) => {
    if (isLowEndDevice) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(callback());
        }, delay);
      });
    }
    return Promise.resolve(callback());
  }, [isLowEndDevice]);

  // Fonction pour limiter les re-renders
  const debounceRender = useCallback((callback, delay = 150) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(...args), delay);
    };
  }, []);

  return {
    isMobile,
    isLowEndDevice,
    connectionSpeed,
    optimizations,
    deferHeavyCalculation,
    debounceRender
  };
};

export default useMobilePerformance;