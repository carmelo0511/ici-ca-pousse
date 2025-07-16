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