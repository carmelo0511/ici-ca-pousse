import { useState, useEffect } from 'react';
import { load, save } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';

export const useWorkouts = () => {
  const [workouts, setWorkouts] = useState([]);

  // Charger les workouts au démarrage
  useEffect(() => {
    const savedWorkouts = load(STORAGE_KEYS.WORKOUTS, []);
    setWorkouts(savedWorkouts);
  }, []);

  // Sauvegarder les workouts quand ils changent
  useEffect(() => {
    save(STORAGE_KEYS.WORKOUTS, workouts);
  }, [workouts]);

  const addWorkout = (workout) => {
    setWorkouts(prev => [...prev, workout]);
  };

  const updateWorkout = (workoutId, updatedWorkout) => {
    setWorkouts(prev => prev.map(w => w.id === workoutId ? updatedWorkout : w));
  };

  const deleteWorkout = (workoutId) => {
    setWorkouts(prev => prev.filter(w => w.id !== workoutId));
  };

  const getWorkoutForDate = (date) => {
    return workouts.find(w => w.date === date);
  };

  const getStats = () => {
    const totalWorkouts = workouts.length;
    const totalSets = workouts.reduce((acc, w) => acc + w.totalSets, 0);
    const totalReps = workouts.reduce((acc, w) => acc + w.totalReps, 0);
    const totalWeight = workouts.reduce((acc, w) => acc + w.totalWeight, 0);
    const avgDuration = workouts.length > 0 
      ? Math.round(workouts.reduce((acc, w) => acc + w.duration, 0) / workouts.length) 
      : 0;
    
    return { totalWorkouts, totalSets, totalReps, totalWeight, avgDuration };
  };

  return {
    workouts,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkoutForDate,
    getStats
  };
}; 