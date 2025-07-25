import { useState, useEffect } from 'react';
import { exerciseDatabase } from '../utils/exerciseDatabase';
import { load, save } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';

export const useExercises = () => {
  const [exercises, setExercises] = useState(() => {
    const saved = load(STORAGE_KEYS.CURRENT_WORKOUT, {});
    return saved.exercises || [];
  });
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);

  const addExercise = (exerciseName, muscleGroup = null) => {
    if (!exerciseName || exerciseName.trim() === '') return;

    const newExercise = {
      id: Date.now(),
      name: exerciseName.trim(),
      sets: [{ reps: 0, weight: 0, duration: 0 }],
      type:
        muscleGroup ||
        Object.keys(exerciseDatabase).find((key) =>
          exerciseDatabase[key].includes(exerciseName)
        ) ||
        'custom', // Utilise la catégorie sélectionnée ou trouve automatiquement
    };
    setExercises((prev) => [...prev, newExercise]);
    setSelectedMuscleGroup(null);
  };

  const updateExercise = (exerciseId, updatedExercise) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? updatedExercise : ex))
    );
  };

  const removeExercise = (exerciseId) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
  };

  const addSet = (exerciseId) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: [...ex.sets, { reps: 0, weight: 0, duration: 0 }] }
          : ex
      )
    );
  };

  const updateSet = (exerciseId, setIndex, field, value) => {
    const parsed =
      field === 'weight'
        ? parseFloat(String(value).replace(',', '.'))
        : parseInt(value, 10);

    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set, idx) =>
                idx === setIndex
                  ? {
                      ...set,
                      [field]: Math.max(0, parsed || 0), // Valeur minimale 0
                    }
                  : set
              ),
            }
          : ex
      )
    );
  };

  const removeSet = (exerciseId, setIndex) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.filter((_, idx) => idx !== setIndex) }
          : ex
      )
    );
  };

  const clearExercises = () => {
    setExercises([]);
    const saved = load(STORAGE_KEYS.CURRENT_WORKOUT, {});
    save(STORAGE_KEYS.CURRENT_WORKOUT, { ...saved, exercises: [] });
  };

  const setExercisesFromWorkout = (workoutExercises) => {
    setExercises(workoutExercises);
    const saved = load(STORAGE_KEYS.CURRENT_WORKOUT, {});
    save(STORAGE_KEYS.CURRENT_WORKOUT, {
      ...saved,
      exercises: workoutExercises,
    });
  };

  useEffect(() => {
    const saved = load(STORAGE_KEYS.CURRENT_WORKOUT, {});
    save(STORAGE_KEYS.CURRENT_WORKOUT, { ...saved, exercises });
  }, [exercises]);

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
    setExercisesFromWorkout,
  };
};
