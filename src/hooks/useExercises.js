import { useState } from 'react';
import { exerciseDatabase } from '../utils/exerciseDatabase';

export const useExercises = () => {
  const [exercises, setExercises] = useState([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);

  const addExercise = (exercise) => {
    const newExercise = {
      id: Date.now(),
      name: exercise,
      sets: [{ reps: 0, weight: 0, duration: 0 }],
      type: Object.keys(exerciseDatabase).find(key => 
        exerciseDatabase[key].includes(exercise)
      )
    };
    setExercises(prev => [...prev, newExercise]);
    setSelectedMuscleGroup(null);
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
    addSet,
    updateSet,
    removeSet,
    clearExercises,
    setExercisesFromWorkout
  };
}; 