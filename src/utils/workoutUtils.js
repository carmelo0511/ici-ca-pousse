// Utilitaires pour la gestion des workouts

// Valeur par défaut pour la durée d'une séance (en minutes)
const DEFAULT_WORKOUT_DURATION = 30;

export const createWorkout = (exercises, date, duration, workoutId = undefined) => {
  if (exercises.length === 0) return null;
  
  return {
    ...(workoutId ? { id: workoutId } : {}),
    date,
    exercises,
    duration: parseInt(duration) || DEFAULT_WORKOUT_DURATION,
    totalSets: exercises.reduce((acc, ex) => acc + ex.sets.length, 0),
    totalReps: exercises.reduce((acc, ex) => 
      acc + ex.sets.reduce((setAcc, set) => setAcc + set.reps, 0), 0
    ),
    totalWeight: exercises.reduce((acc, ex) => 
      acc + ex.sets.reduce((setAcc, set) => setAcc + (set.weight * set.reps), 0), 0
    )
  };
};

export const calculateWorkoutStats = (workouts) => {
  const totalWorkouts = workouts.length;
  const totalSets = workouts.reduce((acc, w) => acc + w.totalSets, 0);
  const totalReps = workouts.reduce((acc, w) => acc + w.totalReps, 0);
  const totalWeight = workouts.reduce((acc, w) => acc + w.totalWeight, 0);
  const avgDuration = totalWorkouts > 0 
    ? Math.round(workouts.reduce((acc, w) => acc + w.duration, 0) / totalWorkouts) 
    : 0;
  
  return { totalWorkouts, totalSets, totalReps, totalWeight, avgDuration };
};

export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' });
};

export const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}; 

// Gamification: retourne les badges débloqués selon les stats
export function getBadges(stats) {
  const badges = [];
  if (stats.totalWorkouts >= 1) badges.push({ key: 'badge_first_workout', label: 'Première séance', icon: '🏅' });
  if (stats.totalWorkouts >= 5) badges.push({ key: 'badge_5_workouts', label: '5 séances', icon: '🥉' });
  if (stats.totalWorkouts >= 10) badges.push({ key: 'badge_10_workouts', label: '10 séances', icon: '🥈' });
  if (stats.totalWorkouts >= 20) badges.push({ key: 'badge_20_workouts', label: '20 séances', icon: '🥇' });
  if (stats.totalSets >= 100) badges.push({ key: 'badge_100_sets', label: '100 séries', icon: '💪' });
  if (stats.totalReps >= 1000) badges.push({ key: 'badge_1000_reps', label: '1000 reps', icon: '🔥' });
  if (stats.totalWeight >= 10000) badges.push({ key: 'badge_10k_weight', label: '10 000 kg soulevés', icon: '🏋️' });
  if (stats.avgDuration >= 60) badges.push({ key: 'badge_long_workout', label: 'Séances longues', icon: '⏱️' });
  return badges;
} 