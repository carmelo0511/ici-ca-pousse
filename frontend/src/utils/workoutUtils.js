// Utilitaires pour la gestion des workouts

import { DEFAULT_WORKOUT_DURATION } from '../constants';

export const createWorkout = (exercises, date, duration, workoutId = null) => {
  if (exercises.length === 0) return null;
  
  return {
    id: workoutId || Date.now(),
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

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
}; 