// Utilitaires pour le leaderboard avancé
import { PERIODS, METRICS, ALLOWED_EXERCISES } from '../constants/leaderboard';

// Obtenir la date de début selon la période
export function getStartDate(period) {
  const now = new Date();
  const start = new Date(now);
  
  switch (period) {
    case PERIODS.WEEK:
      start.setDate(now.getDate() - 7);
      break;
    case PERIODS.MONTH:
      start.setMonth(now.getMonth() - 1);
      break;
    case PERIODS.YEAR:
      start.setFullYear(now.getFullYear() - 1);
      break;
    case PERIODS.ALL_TIME:
      return new Date(0); // 1er janvier 1970
    default:
      start.setDate(now.getDate() - 7);
  }
  
  return start;
}

// Filtrer les workouts par période
export function filterWorkoutsByPeriod(workouts, period) {
  const startDate = getStartDate(period);
  return workouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    return workoutDate >= startDate;
  });
}

// Calculer les statistiques pour un utilisateur
export function calculateUserStats(workouts, period = PERIODS.ALL_TIME) {
  const filteredWorkouts = filterWorkoutsByPeriod(workouts, period);
  
  const stats = {
    workouts: filteredWorkouts.length,
    maxWeight: 0,
    exerciseStats: {}
  };

  // Calculer les totaux
  filteredWorkouts.forEach(workout => {
    // Statistiques par exercice (seulement les exercices autorisés)
    workout.exercises?.forEach(exercise => {
      if (!ALLOWED_EXERCISES.includes(exercise.name)) return;
      
      if (!stats.exerciseStats[exercise.name]) {
        stats.exerciseStats[exercise.name] = {
          name: exercise.name,
          count: 0,
          maxWeight: 0
        };
      }

      const exerciseStat = stats.exerciseStats[exercise.name];
      exerciseStat.count++;

      exercise.sets.forEach(set => {
        const weight = set.weight || 0;
        exerciseStat.maxWeight = Math.max(exerciseStat.maxWeight, weight);
        stats.maxWeight = Math.max(stats.maxWeight, weight);
      });
    });
  });

  return stats;
}

// Obtenir le classement pour une métrique donnée
export function getLeaderboardRanking(usersStats, metric) {
  return usersStats
    .map(user => {
      let value = 0;
      
      // Mapper les métriques aux bonnes propriétés
      if (metric === METRICS.WORKOUTS) {
        value = user.stats.workouts || 0;
      } else if (metric === METRICS.MAX_WEIGHT) {
        value = user.stats.maxWeight || 0;
      }
      
      return {
        uid: user.uid,
        displayName: user.displayName,
        value: value,
        stats: user.stats,
        photoURL: user.photoURL,
        selectedBadge: user.selectedBadge,
        badges: user.badges
      };
    })
    .sort((a, b) => b.value - a.value)
    .map((user, index) => ({
      ...user,
      rank: index + 1,
      medal: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null
    }));
}

// Formater les valeurs selon la métrique
export function formatMetricValue(value, metric) {
  switch (metric) {
    case METRICS.WORKOUTS:
      return `${value} séances`;
    case METRICS.MAX_WEIGHT:
      return `${value} kg`;
    default:
      return value;
  }
}

// Obtenir le label de la période
export function getPeriodLabel(period) {
  switch (period) {
    case PERIODS.WEEK:
      return 'Cette semaine';
    case PERIODS.MONTH:
      return 'Ce mois';
    case PERIODS.YEAR:
      return 'Cette année';
    case PERIODS.ALL_TIME:
      return 'Tout le temps';
    default:
      return 'Cette semaine';
  }
}

// Obtenir le label de la métrique
export function getMetricLabel(metric) {
  switch (metric) {
    case METRICS.WORKOUTS:
      return 'Séances';
    case METRICS.MAX_WEIGHT:
      return 'Poids max';
    default:
      return 'Métrique';
  }
}

// Obtenir la liste des exercices autorisés
export function getAllowedExercises() {
  return ALLOWED_EXERCISES;
} 