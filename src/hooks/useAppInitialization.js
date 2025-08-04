import { useEffect } from 'react';
import { inject as injectAnalytics } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
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

  // Initialize Vercel Analytics and Speed Insights
  useEffect(() => {
    try {
      injectAnalytics();
      injectSpeedInsights();
    } catch (error) {
      console.warn('Failed to initialize Vercel analytics:', error);
    }
  }, []);
};