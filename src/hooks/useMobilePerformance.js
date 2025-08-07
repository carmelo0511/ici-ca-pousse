import { useState, useEffect, useCallback, useRef } from 'react';

// Hook pour optimiser les performances mobiles - Version corrigée
export default function useMobilePerformance() {
  const [deviceInfo, setDeviceInfo] = useState({
    isLowEnd: false,
    isSlowNetwork: false,
    connectionType: 'unknown',
    deviceMemory: 4,
    hardwareConcurrency: 4,
    isMobile: false,
    isIOS: false,
    isAndroid: false
  });

  const [performanceMetrics, setPerformanceMetrics] = useState({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null
  });

  // Utiliser des refs pour stocker les observers de manière sûre
  const observersRef = useRef({});
  const isInitializedRef = useRef(false);

  // Détecter les capacités de l'appareil
  const detectDeviceCapabilities = useCallback(() => {
    const memory = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const userAgent = navigator.userAgent.toLowerCase();

    const deviceInfo = {
      deviceMemory: memory,
      hardwareConcurrency: cores,
      isLowEnd: memory < 4 || cores < 4,
      isSlowNetwork: false,
      connectionType: 'unknown',
      isMobile: /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent),
      isIOS: /iphone|ipad|ipod/i.test(userAgent),
      isAndroid: /android/i.test(userAgent)
    };

    if (connection) {
      deviceInfo.connectionType = connection.effectiveType || connection.type || 'unknown';
      deviceInfo.isSlowNetwork = 
        connection.effectiveType === 'slow-2g' || 
        connection.effectiveType === '2g' ||
        (connection.downlink && connection.downlink < 1.5);
    }

    setDeviceInfo(deviceInfo);
  }, []);

  // Monitorer les Core Web Vitals de manière sécurisée
  const initCoreWebVitals = useCallback(() => {
    if (!('PerformanceObserver' in window) || isInitializedRef.current) {
      return;
    }

    try {
      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        try {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              setPerformanceMetrics(prev => ({
                ...prev,
                fcp: Math.round(entry.startTime)
              }));
            }
          }
        } catch (error) {
          console.warn('Erreur FCP observer:', error);
        }
      });
      
      fcpObserver.observe({ entryTypes: ['paint'] });
      observersRef.current.fcp = fcpObserver;

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        try {
          for (const entry of list.getEntries()) {
            setPerformanceMetrics(prev => ({
              ...prev,
              lcp: Math.round(entry.startTime)
            }));
          }
        } catch (error) {
          console.warn('Erreur LCP observer:', error);
        }
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      observersRef.current.lcp = lcpObserver;

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        try {
          for (const entry of list.getEntries()) {
            setPerformanceMetrics(prev => ({
              ...prev,
              fid: Math.round(entry.processingStart - entry.startTime)
            }));
          }
        } catch (error) {
          console.warn('Erreur FID observer:', error);
        }
      });
      
      fidObserver.observe({ entryTypes: ['first-input'] });
      observersRef.current.fid = fidObserver;

      // Cumulative Layout Shift - Version simplifiée et sécurisée
      const clsObserver = new PerformanceObserver((list) => {
        try {
          let clsValue = 0;
          const entries = list.getEntries();
          
          for (const entry of entries) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          
          if (clsValue > 0) {
            setPerformanceMetrics(prev => ({
              ...prev,
              cls: Math.round((prev.cls || 0 + clsValue) * 1000) / 1000
            }));
          }
        } catch (error) {
          console.warn('Erreur CLS observer:', error);
        }
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      observersRef.current.cls = clsObserver;

      // Time to First Byte
      try {
        const navigationEntries = performance.getEntriesByType('navigation');
        if (navigationEntries.length > 0) {
          const navTiming = navigationEntries[0];
          setPerformanceMetrics(prev => ({
            ...prev,
            ttfb: Math.round(navTiming.responseStart - navTiming.requestStart)
          }));
        }
      } catch (error) {
        console.warn('Erreur TTFB:', error);
      }

      isInitializedRef.current = true;

    } catch (error) {
      console.error('Erreur lors de l\'initialisation des Core Web Vitals:', error);
    }
  }, []);

  // Optimiser pour appareils bas de gamme
  const getOptimizedSettings = useCallback(() => ({
    enableAnimations: !deviceInfo.isLowEnd,
    enableTransitions: !deviceInfo.isLowEnd,
    imageQuality: deviceInfo.isLowEnd ? 'low' : 'high',
    prefetchLevel: deviceInfo.isSlowNetwork ? 'minimal' : 'aggressive',
    cacheStrategy: deviceInfo.isSlowNetwork ? 'conservative' : 'normal',
    enableBackgroundSync: !deviceInfo.isLowEnd,
    maxConcurrentRequests: deviceInfo.isLowEnd ? 2 : 6,
    enableWebP: !deviceInfo.isLowEnd,
    enableLazyLoading: true,
    throttleAnimations: deviceInfo.isLowEnd
  }), [deviceInfo]);

  // Calculer le score de performance
  const getPerformanceScore = useCallback(() => {
    const { fcp, lcp, fid, cls } = performanceMetrics;
    
    if (!fcp || !lcp || fid === null || cls === null) {
      return null;
    }

    let score = 100;

    // FCP scoring (poids: 25%)
    if (fcp > 3000) score -= 25;
    else if (fcp > 1800) score -= 15;
    else if (fcp > 1000) score -= 5;

    // LCP scoring (poids: 25%)
    if (lcp > 4000) score -= 25;
    else if (lcp > 2500) score -= 15;
    else if (lcp > 1500) score -= 5;

    // FID scoring (poids: 25%)
    if (fid > 300) score -= 25;
    else if (fid > 100) score -= 15;
    else if (fid > 50) score -= 5;

    // CLS scoring (poids: 25%)
    if (cls > 0.25) score -= 25;
    else if (cls > 0.1) score -= 15;
    else if (cls > 0.05) score -= 5;

    return Math.max(0, Math.round(score));
  }, [performanceMetrics]);

  // Obtenir des recommandations
  const getRecommendations = useCallback(() => {
    const recommendations = [];
    const { fcp, lcp, fid, cls } = performanceMetrics;

    if (fcp && fcp > 1800) {
      recommendations.push({
        type: 'fcp',
        priority: 'high',
        message: 'Optimiser le First Contentful Paint',
        actions: ['Réduire la taille des bundles', 'Précharger les ressources critiques']
      });
    }

    if (lcp && lcp > 2500) {
      recommendations.push({
        type: 'lcp',
        priority: 'high', 
        message: 'Optimiser le Largest Contentful Paint',
        actions: ['Optimiser les images', 'Utiliser un CDN', 'Précharger les ressources LCP']
      });
    }

    if (fid && fid > 100) {
      recommendations.push({
        type: 'fid',
        priority: 'medium',
        message: 'Réduire le First Input Delay',
        actions: ['Code splitting', 'Lazy loading', 'Optimiser le JavaScript']
      });
    }

    if (cls && cls > 0.1) {
      recommendations.push({
        type: 'cls',
        priority: 'medium',
        message: 'Réduire le Cumulative Layout Shift',
        actions: ['Réserver de l\'espace pour les images', 'Éviter le contenu dynamique']
      });
    }

    if (deviceInfo.isLowEnd) {
      recommendations.push({
        type: 'device',
        priority: 'medium',
        message: 'Optimisations pour appareil bas de gamme détectées',
        actions: ['Réduire les animations', 'Utiliser des images compressées']
      });
    }

    return recommendations;
  }, [performanceMetrics, deviceInfo]);

  // Initialisation simplifiée et sécurisée
  useEffect(() => {
    let cleanup = () => {};

    try {
      detectDeviceCapabilities();
      
      // Délai pour éviter les problèmes lors du rendu initial
      const timeoutId = setTimeout(() => {
        initCoreWebVitals();
      }, 100);

      cleanup = () => {
        clearTimeout(timeoutId);
      };
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du hook:', error);
    }

    return cleanup;
  }, []); // Dépendances vides pour éviter les re-renders

  // Cleanup des observers de manière sécurisée
  useEffect(() => {
    return () => {
      try {
        Object.values(observersRef.current).forEach(observer => {
          if (observer && typeof observer.disconnect === 'function') {
            observer.disconnect();
          }
        });
        observersRef.current = {};
        isInitializedRef.current = false;
      } catch (error) {
        console.warn('Erreur lors du nettoyage des observers:', error);
      }
    };
  }, []);

  return {
    deviceInfo,
    performanceMetrics,
    optimizedSettings: getOptimizedSettings(),
    performanceScore: getPerformanceScore(),
    recommendations: getRecommendations(),
    memoryInfo: null, // Simplifié pour éviter les problèmes
    cleanupMemory: () => {}, // Placeholder
    // Utilitaires
    isLowEndDevice: deviceInfo.isLowEnd,
    isSlowNetwork: deviceInfo.isSlowNetwork,
    isMobile: deviceInfo.isMobile,
    shouldOptimize: deviceInfo.isLowEnd || deviceInfo.isSlowNetwork
  };
}