import { useEffect } from 'react';
import { initAllGlassEffects } from '../utils/glassParticles';
import { GLASS_EFFECTS_CONFIG } from '../config/app';

/**
 * Hook pour initialiser les services de l'application
 */
export const useAppInitialization = () => {
  // Initialize glass effects
  useEffect(() => {
    initAllGlassEffects(GLASS_EFFECTS_CONFIG.PARTICLE_COUNT);
  }, []);

  // Initialize Vercel Analytics and Speed Insights (loaded dynamically to avoid build-time resolution errors)
  useEffect(() => {
    let isCancelled = false;
    (async () => {
      // Load analytics
      try {
        const analyticsModule = await import('@vercel/analytics');
        if (!isCancelled && analyticsModule?.inject) {
          analyticsModule.inject();
        }
      } catch (error) {
        // Optional: silent if not installed
        console.warn('Vercel Analytics not available:', error?.message || error);
      }

      // Load speed insights
      try {
        const speedModule = await import('@vercel/speed-insights');
        if (!isCancelled && speedModule?.injectSpeedInsights) {
          speedModule.injectSpeedInsights();
        }
      } catch (error) {
        // Optional: silent if not installed
        console.warn('Vercel Speed Insights not available:', error?.message || error);
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, []);
};