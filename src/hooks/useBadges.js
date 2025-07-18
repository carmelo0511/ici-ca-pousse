import { useMemo, useEffect } from 'react';
import { BADGE_TYPES } from '../constants/badges';
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

  // Badges de séries d'entraînement
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

  // Badges de séries
  if (maxStreak >= 3) badges.push(BADGE_TYPES.WORKOUT_STREAK);
  if (maxStreak >= 5) badges.push(BADGE_TYPES.STREAK_5);
  if (maxStreak >= 10) badges.push(BADGE_TYPES.STREAK_10);
  if (maxStreak >= 20) badges.push(BADGE_TYPES.STREAK_20);
  if (maxStreak >= 30) badges.push(BADGE_TYPES.STREAK_30);
  if (maxStreak >= 50) badges.push(BADGE_TYPES.STREAK_50);
  if (maxStreak >= 100) badges.push(BADGE_TYPES.STREAK_100);

  // Badges de poids
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

  if (maxWeight >= 50) badges.push(BADGE_TYPES.WEIGHT_50);
  if (maxWeight >= 75) badges.push(BADGE_TYPES.WEIGHT_75);
  if (maxWeight >= 100) badges.push(BADGE_TYPES.WEIGHT_100);
  if (maxWeight >= 125) badges.push(BADGE_TYPES.WEIGHT_125);
  if (maxWeight >= 150) badges.push(BADGE_TYPES.WEIGHT_150);
  if (maxWeight >= 200) badges.push(BADGE_TYPES.WEIGHT_200);
  if (maxWeight >= 250) badges.push(BADGE_TYPES.WEIGHT_250);

  // Badges de séances totales
  if (workouts.length >= 10) badges.push(BADGE_TYPES.WORKOUTS_10);
  if (workouts.length >= 25) badges.push(BADGE_TYPES.WORKOUTS_25);
  if (workouts.length >= 50) badges.push(BADGE_TYPES.WORKOUTS_50);
  if (workouts.length >= 100) badges.push(BADGE_TYPES.WORKOUTS_100);
  if (workouts.length >= 250) badges.push(BADGE_TYPES.WORKOUTS_250);
  if (workouts.length >= 500) badges.push(BADGE_TYPES.WORKOUTS_500);

  // Badges de régularité hebdomadaire
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentWorkouts = workouts.filter(w => new Date(w.date) >= oneWeekAgo);
  
  if (recentWorkouts.length >= 3) badges.push(BADGE_TYPES.WEEKLY_3);
  if (recentWorkouts.length >= 5) badges.push(BADGE_TYPES.WEEKLY_5);
  if (recentWorkouts.length >= 7) badges.push(BADGE_TYPES.WEEKLY_7);

  // Badges de régularité mensuelle
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const monthlyWorkouts = workouts.filter(w => new Date(w.date) >= oneMonthAgo);
  
  if (monthlyWorkouts.length >= 10) badges.push(BADGE_TYPES.MONTHLY_10);
  if (monthlyWorkouts.length >= 20) badges.push(BADGE_TYPES.MONTHLY_20);
  if (monthlyWorkouts.length >= 30) badges.push(BADGE_TYPES.MONTHLY_30);

  // Badges de défis
  const wonChallenges = challenges.filter(challenge => 
    challenge.winnerId === user?.uid && challenge.status === 'completed'
  );
  
  if (wonChallenges.length >= 1) badges.push(BADGE_TYPES.CHALLENGE_WINNER);
  if (wonChallenges.length >= 5) badges.push(BADGE_TYPES.CHALLENGE_5);
  if (wonChallenges.length >= 10) badges.push(BADGE_TYPES.CHALLENGE_10);
  if (wonChallenges.length >= 25) badges.push(BADGE_TYPES.CHALLENGE_25);
  if (wonChallenges.length >= 50) badges.push(BADGE_TYPES.CHALLENGE_50);

  // Badges d'exercices spécifiques
  const exerciseCounts = {};
  workouts.forEach(workout => {
    workout.exercises?.forEach(exercise => {
      exerciseCounts[exercise.name] = (exerciseCounts[exercise.name] || 0) + 1;
    });
  });

  if (exerciseCounts['Développé couché'] >= 10) badges.push(BADGE_TYPES.BENCH_MASTER);
  if (exerciseCounts['Squat'] >= 10) badges.push(BADGE_TYPES.SQUAT_MASTER);
  if (exerciseCounts['Soulevé de terre'] >= 10) badges.push(BADGE_TYPES.DEADLIFT_MASTER);
  if (exerciseCounts['Tractions'] >= 10) badges.push(BADGE_TYPES.PULLUP_MASTER);
  if (exerciseCounts['Pompes'] >= 10) badges.push(BADGE_TYPES.PUSHUP_MASTER);

  // Badges de temps
  const earlyWorkouts = workouts.filter(w => {
    const hour = new Date(w.date).getHours();
    return hour < 8;
  });
  if (earlyWorkouts.length >= 5) badges.push(BADGE_TYPES.EARLY_BIRD);

  const nightWorkouts = workouts.filter(w => {
    const hour = new Date(w.date).getHours();
    return hour >= 22;
  });
  if (nightWorkouts.length >= 5) badges.push(BADGE_TYPES.NIGHT_OWL);

  const weekendWorkouts = workouts.filter(w => {
    const day = new Date(w.date).getDay();
    return day === 0 || day === 6;
  });
  if (weekendWorkouts.length >= 10) badges.push(BADGE_TYPES.WEEKEND_WARRIOR);

  // Badges spéciaux
  if (workouts.length >= 100) badges.push(BADGE_TYPES.GOLDEN_MEMBER);
  if (workouts.length >= 50) badges.push(BADGE_TYPES.SILVER_MEMBER);
  if (workouts.length >= 25) badges.push(BADGE_TYPES.BRONZE_MEMBER);
  if (workouts.length >= 500) badges.push(BADGE_TYPES.PLATINUM_MEMBER);

  // Badges de saison (simplifiés)
  const currentMonth = new Date().getMonth();
  if (currentMonth >= 2 && currentMonth <= 4) badges.push(BADGE_TYPES.SPRING_TRAINER);
  if (currentMonth >= 5 && currentMonth <= 7) badges.push(BADGE_TYPES.SUMMER_WARRIOR);
  if (currentMonth >= 8 && currentMonth <= 10) badges.push(BADGE_TYPES.AUTUMN_STRENGTH);
  if (currentMonth === 11 || currentMonth <= 1) badges.push(BADGE_TYPES.WINTER_CHAMPION);

  // Badges de variété
  const uniqueExercises = Object.keys(exerciseCounts).length;
  if (uniqueExercises >= 10) badges.push(BADGE_TYPES.EXERCISE_EXPLORER);
  if (uniqueExercises >= 20) badges.push(BADGE_TYPES.VARIETY_KING);

  // Badges de motivation (simplifiés)
  if (workouts.length >= 50 && maxStreak >= 10) badges.push(BADGE_TYPES.MOTIVATION_MASTER);
  if (workouts.length >= 100) badges.push(BADGE_TYPES.CONSISTENCY_KING);
  if (workouts.length >= 25) badges.push(BADGE_TYPES.PROGRESS_MAKER);

  // Badges de performance (simplifiés)
  if (maxWeight >= 150) badges.push(BADGE_TYPES.STRENGTH_LEGEND);
  if (workouts.length >= 100) badges.push(BADGE_TYPES.ENDURANCE_KING);

  // Badges de records
  if (maxWeight >= 200) badges.push(BADGE_TYPES.PERSONAL_BEST);
  if (workouts.length >= 1000) badges.push(BADGE_TYPES.WORLD_RECORD);

  // Badges d'équipe/solo
  if (challenges.length > 0) badges.push(BADGE_TYPES.TEAM_PLAYER);
  if (workouts.length >= 50 && challenges.length === 0) badges.push(BADGE_TYPES.SOLO_CHAMPION);

  // Badges de routine
  if (workouts.length >= 100) badges.push(BADGE_TYPES.ROUTINE_MASTER);
  if (uniqueExercises >= 5) badges.push(BADGE_TYPES.SPECIALIST);

  return [...new Set(badges)]; // Supprimer les doublons
}

// Hook pour utiliser les badges
export function useBadges(workouts, challenges, user, addBadgeUnlockXP) {
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
        
        // Ajouter de l'XP pour les nouveaux badges débloqués
        if (addBadgeUnlockXP) {
          const newBadges = badges.filter(badge => !currentBadges.includes(badge));
          newBadges.forEach(async (badge) => {
                          try {
                await addBadgeUnlockXP(badge);
                // Badge débloqué avec succès
              } catch (error) {
              console.error('Erreur lors de l\'ajout d\'XP pour badge:', error);
            }
          });
        }
      }
    }
  }, [badges, user, addBadgeUnlockXP]);

  return {
    badges,
    badgeCount,
    hasBadge: (badgeType) => badges.includes(badgeType),
    selectedBadge: user?.selectedBadge || null
  };
} 