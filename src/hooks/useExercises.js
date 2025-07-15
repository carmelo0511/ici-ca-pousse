import { useState } from 'react';
import { exerciseDatabase } from '../utils/exerciseDatabase';

export const useExercises = () => {
  const [exercises, setExercises] = useState([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);

  const addExercise = (exerciseName) => {
    const newExercise = {
      id: Date.now(),
      name: exerciseName,
      sets: [{ reps: 0, weight: 0, duration: 0 }],
      type: Object.keys(exerciseDatabase).find(key => 
        exerciseDatabase[key].includes(exerciseName)
      )
    };
    setExercises(prev => [...prev, newExercise]);
    setSelectedMuscleGroup(null);
  };

  const updateExercise = (exerciseId, updatedExercise) => {
    setExercises(prev => prev.map(ex => 
      ex.id === exerciseId ? updatedExercise : ex
    ));
  };

  const removeExercise = (exerciseId) => {
    setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  const addSet = (exerciseId) => {
    setExercises(prev => prev.map(ex => 
      ex.id === exerciseId 
        ? { ...ex, sets: [...ex.sets, { reps: 0, weight: 0, duration: 0 }] }
        : ex
    ));
  };

  const updateSet = (exerciseId, setIndex, field, value) => {
    setExercises(prev => prev.map(ex => 
      ex.id === exerciseId 
        ? { 
            ...ex, 
            sets: ex.sets.map((set, idx) => 
              idx === setIndex ? { ...set, [field]: parseInt(value) || 0 } : set
            )
          }
        : ex
    ));
  };

  const removeSet = (exerciseId, setIndex) => {
    setExercises(prev => prev.map(ex => 
      ex.id === exerciseId 
        ? { ...ex, sets: ex.sets.filter((_, idx) => idx !== setIndex) }
        : ex
    ));
  };

  const clearExercises = () => {
    setExercises([]);
  };

  const setExercisesFromWorkout = (workoutExercises) => {
    setExercises(workoutExercises);
  };

  return {
    exercises,
    selectedMuscleGroup,
    setSelectedMuscleGroup,
    addExercise,
    updateExercise,
    removeExercise,
    addSet,
    updateSet,
    removeSet,
    clearExercises,
    setExercisesFromWorkout
  };
}; 