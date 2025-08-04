import { useEffect } from 'react';
import { STREAK_CONFIG } from '../config/app';

/**
 * Hook pour gérer le recalcul automatique du streak
 */
export const useStreakRecalculation = (user, workouts, recalculateStreak) => {
  useEffect(() => {
    if (user && workouts.length > 0) {
      // Recalculer le streak une fois par jour au maximum
      const lastRecalculation = localStorage.getItem(STREAK_CONFIG.STORAGE_KEY);
      const today = new Date().toDateString();

      if (lastRecalculation !== today) {
        recalculateStreak(workouts)
          .then(() => {
            localStorage.setItem(STREAK_CONFIG.STORAGE_KEY, today);
          })
          .catch((error) => {
            console.error(
              'Erreur lors du recalcul automatique du streak:',
              error
            );
          });
      }
    }
  }, [user, workouts, recalculateStreak]);
};