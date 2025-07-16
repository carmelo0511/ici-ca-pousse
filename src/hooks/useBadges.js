import { useMemo, useEffect } from 'react';
import { BADGE_TYPES } from '../components/Badges';
import { saveUserBadges } from '../utils/firebase';

// Fonction pour calculer les badges d'un utilisateur
export function calculateUserBadges(workouts = [], challenges = [], user) {
  const badges = [];

  if (!workouts || workouts.length === 0) {
    return badges;
  }

  // Badge première séance
  if (workouts.length >= 1) {
    badges.push(BADGE_TYPES.FIRST_WORKOUT);
  }

  // Badge série d'entraînement (3 séances consécutives)
  const sortedWorkouts = [...workouts].sort((a, b) => new Date(a.date) - new Date(b.date));
  let currentStreak = 1;
  let maxStreak = 1;

  for (let i = 1; i < sortedWorkouts.length; i++) {
    const prevDate = new Date(sortedWorkouts[i - 1].date);
    const currDate = new Date(sortedWorkouts[i].date);
    const dayDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

    if (dayDiff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  if (maxStreak >= 3) {
    badges.push(BADGE_TYPES.WORKOUT_STREAK);
  }

  // Badge régularité (5 séances en 1 semaine)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentWorkouts = workouts.filter(w => new Date(w.date) >= oneWeekAgo);
  
  if (recentWorkouts.length >= 5) {
    badges.push(BADGE_TYPES.CONSISTENCY);
  }

  // Badge maître du poids (poids max > 100kg)
  let maxWeight = 0;
  workouts.forEach(workout => {
    workout.exercises?.forEach(exercise => {
      exercise.sets?.forEach(set => {
        if (set.weight > maxWeight) {
          maxWeight = set.weight;
        }
      });
    });
  });

  if (maxWeight >= 100) {
    badges.push(BADGE_TYPES.WEIGHT_MASTER);
  }

  // Badge vainqueur de défi
  const wonChallenges = challenges.filter(challenge => 
    challenge.winnerId === user?.uid && challenge.status === 'completed'
  );
  
  if (wonChallenges.length > 0) {
    badges.push(BADGE_TYPES.CHALLENGE_WINNER);
  }

  // Badge objectif hebdomadaire (si l'utilisateur a fait au moins 3 séances cette semaine)
  if (recentWorkouts.length >= 3) {
    badges.push(BADGE_TYPES.WEEKLY_GOAL);
  }

  // Badge objectif mensuel (si l'utilisateur a fait au moins 10 séances ce mois)
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const monthlyWorkouts = workouts.filter(w => new Date(w.date) >= oneMonthAgo);
  
  if (monthlyWorkouts.length >= 10) {
    badges.push(BADGE_TYPES.MONTHLY_GOAL);
  }

  return [...new Set(badges)]; // Supprimer les doublons
}

// Hook pour utiliser les badges
export function useBadges(workouts, challenges, user) {
  const badges = useMemo(() => {
    return calculateUserBadges(workouts, challenges, user);
  }, [workouts, challenges, user]);

  const badgeCount = badges.length;

  // Sauvegarder automatiquement les badges dans Firebase quand ils changent
  useEffect(() => {
    if (user && user.uid && badges.length > 0) {
      // Vérifier si les badges ont changé par rapport à ceux stockés
      const currentBadges = user.badges || [];
      const hasChanged = badges.length !== currentBadges.length || 
                        !badges.every(badge => currentBadges.includes(badge));
      
      if (hasChanged) {
        saveUserBadges(user.uid, badges).catch(error => {
          console.error('Erreur lors de la sauvegarde des badges:', error);
        });
      }
    }
  }, [badges, user]);

  return {
    badges,
    badgeCount,
    hasBadge: (badgeType) => badges.includes(badgeType),
    selectedBadge: user?.selectedBadge || null
  };
} 