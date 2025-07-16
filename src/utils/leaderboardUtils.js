// Utilitaires pour le leaderboard avancé

// Périodes disponibles
export const PERIODS = {
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
  ALL_TIME: 'all_time'
};

// Types de métriques
export const METRICS = {
  WORKOUTS: 'workouts',
  DURATION: 'duration',
  TOTAL_WEIGHT: 'total_weight',
  TOTAL_REPS: 'total_reps',
  TOTAL_SETS: 'total_sets',
  EXERCISE_SPECIFIC: 'exercise_specific'
};

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
    totalWorkouts: filteredWorkouts.length,
    totalDuration: 0,
    totalWeight: 0,
    totalReps: 0,
    totalSets: 0,
    exerciseStats: {},
    averageWorkoutDuration: 0,
    workoutFrequency: 0, // séances par semaine
    bestExercise: null,
    mostFrequentExercise: null
  };

  // Calculer les totaux
  filteredWorkouts.forEach(workout => {
    stats.totalDuration += workout.duration || 0;
    stats.totalWeight += workout.totalWeight || 0;
    stats.totalReps += workout.totalReps || 0;
    stats.totalSets += workout.totalSets || 0;

    // Statistiques par exercice
    workout.exercises?.forEach(exercise => {
      if (!stats.exerciseStats[exercise.name]) {
        stats.exerciseStats[exercise.name] = {
          name: exercise.name,
          count: 0,
          totalWeight: 0,
          totalReps: 0,
          totalSets: 0,
          bestWeight: 0,
          bestReps: 0
        };
      }

      const exerciseStat = stats.exerciseStats[exercise.name];
      exerciseStat.count++;
      exerciseStat.totalSets += exercise.sets.length;

      exercise.sets.forEach(set => {
        exerciseStat.totalWeight += (set.weight || 0) * (set.reps || 0);
        exerciseStat.totalReps += set.reps || 0;
        exerciseStat.bestWeight = Math.max(exerciseStat.bestWeight, set.weight || 0);
        exerciseStat.bestReps = Math.max(exerciseStat.bestReps, set.reps || 0);
      });
    });
  });

  // Calculer les moyennes
  if (stats.totalWorkouts > 0) {
    stats.averageWorkoutDuration = Math.round(stats.totalDuration / stats.totalWorkouts);
  }

  // Calculer la fréquence (séances par semaine)
  const daysDiff = period === PERIODS.WEEK ? 7 : 
                   period === PERIODS.MONTH ? 30 : 
                   period === PERIODS.YEAR ? 365 : 
                   Math.max(1, (new Date() - getStartDate(period)) / (1000 * 60 * 60 * 24));
  stats.workoutFrequency = Math.round((stats.totalWorkouts / daysDiff) * 7 * 10) / 10;

  // Trouver le meilleur exercice (plus de poids total)
  const exerciseEntries = Object.entries(stats.exerciseStats);
  if (exerciseEntries.length > 0) {
    stats.bestExercise = exerciseEntries.reduce((best, [name, stat]) => 
      stat.totalWeight > best.totalWeight ? { name, ...stat } : best
    )[1];

    stats.mostFrequentExercise = exerciseEntries.reduce((most, [name, stat]) => 
      stat.count > most.count ? { name, ...stat } : most
    )[1];
  }

  return stats;
}

// Obtenir le classement pour une métrique donnée
export function getLeaderboardRanking(usersStats, metric) {
  return usersStats
    .map(user => ({
      uid: user.uid,
      displayName: user.displayName,
      value: user.stats[metric] || 0,
      stats: user.stats
    }))
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
    case METRICS.DURATION:
      return `${value} min`;
    case METRICS.TOTAL_WEIGHT:
      return `${value} kg`;
    case METRICS.TOTAL_REPS:
      return `${value} reps`;
    case METRICS.TOTAL_SETS:
      return `${value} séries`;
    case METRICS.EXERCISE_SPECIFIC:
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
    case METRICS.DURATION:
      return 'Temps total';
    case METRICS.TOTAL_WEIGHT:
      return 'Poids total';
    case METRICS.TOTAL_REPS:
      return 'Répétitions';
    case METRICS.TOTAL_SETS:
      return 'Séries';
    case METRICS.EXERCISE_SPECIFIC:
      return 'Exercice spécifique';
    default:
      return metric;
  }
} 