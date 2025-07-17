import { useCallback } from 'react';
import { createWorkout } from '../utils/workoutUtils';

export default function useWorkoutLogic({
  exercises,
  selectedDate,
  startTime,
  endTime,
  selectedWorkout,
  addWorkout,
  updateWorkout,
  deleteWorkout,
  addExercise,
  clearExercises,
  setStartTime,
  setEndTime,
  setSelectedWorkout,
  setShowAddExercise,
  setSelectedMuscleGroup,
  setActiveTab,
  setSelectedDate,
  setExercisesFromWorkout,
  setShowWorkoutDetail,
  showToastMsg,
  t,
  addWorkoutXP,
  workouts
}) {
  // Ajout d'un exercice à la séance
  const addExerciseToWorkout = useCallback((exerciseName) => {
    addExercise(exerciseName);
    setShowAddExercise(false);
    setSelectedMuscleGroup(null);
    showToastMsg(t('exercise_added'));
  }, [addExercise, setShowAddExercise, setSelectedMuscleGroup, showToastMsg, t]);

  // Sauvegarde d'une séance
  const saveWorkout = useCallback(async () => {
    if (exercises.length === 0) return;
    let duration = 30;
    if (startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      duration = Math.round((end - start) / (1000 * 60));
    }
    const workout = createWorkout(
      exercises,
      selectedDate,
      duration,
      selectedWorkout && typeof selectedWorkout.id === 'string' ? selectedWorkout.id : undefined,
      startTime,
      endTime
    );
    if (selectedWorkout && typeof selectedWorkout.id === 'string') {
      try {
        await updateWorkout(selectedWorkout.id, workout);
        showToastMsg(t('workout_updated'));
      } catch (e) {
        showToastMsg(t('error_update'), 'error');
      }
    } else {
      await addWorkout(workout);
      // Ajouter de l'XP pour la nouvelle séance
      if (addWorkoutXP) {
        try {
          const previousWorkouts = workouts.slice(-5); // Derniers 5 workouts pour le calcul du streak
          const result = await addWorkoutXP(workout, previousWorkouts);
          if (result && result.levelUp) {
            showToastMsg(`🎉 Niveau ${result.newLevel} atteint ! ${result.newLevelName}`, 'success');
          } else if (result && result.streakIncreased) {
            showToastMsg(`🔥 Streak +1 ! ${result.newStreak} jours !`, 'success');
          } else {
            showToastMsg(`+${result?.xpGained || 0} XP gagné ! 💪`, 'success');
          }
        } catch (error) {
          console.error('Erreur lors de l\'ajout d\'XP:', error);
        }
      }
      showToastMsg(t('workout_saved'));
    }
    clearExercises();
    setStartTime('');
    setEndTime('');
    setSelectedWorkout(null);
    setShowWorkoutDetail(false); // Fermer la modale/détail après ajout
  }, [exercises, selectedDate, startTime, endTime, selectedWorkout, addWorkout, updateWorkout, clearExercises, setStartTime, setEndTime, setSelectedWorkout, setShowWorkoutDetail, showToastMsg, t, addWorkoutXP, workouts]);

  // Ouvre le détail d'une séance
  const openWorkoutDetail = useCallback((workout) => {
    setSelectedWorkout(workout);
    setShowWorkoutDetail(true);
  }, [setSelectedWorkout, setShowWorkoutDetail]);

  // Prépare l'édition d'une séance
  const handleEditWorkout = useCallback((workout) => {
    setSelectedWorkout(workout);
    setSelectedDate(workout.date);
    setStartTime(workout.startTime);
    setEndTime(workout.endTime);
    setExercisesFromWorkout(workout.exercises);
    setActiveTab('workout');
  }, [setSelectedWorkout, setSelectedDate, setStartTime, setEndTime, setExercisesFromWorkout, setActiveTab]);

  // Suppression d'une séance
  const handleDeleteWorkout = useCallback(async (workoutId) => {
    if (typeof workoutId === 'string' && window.confirm(t('confirm_delete_workout'))) {
      try {
        await deleteWorkout(workoutId);
        setShowWorkoutDetail(false); // Fermer la modale après suppression
        showToastMsg(t('workout_deleted'), 'success');
      } catch (e) {
        showToastMsg(t('error_delete'), 'error');
      }
    } else {
      showToastMsg('Suppression impossible : id de séance invalide.', 'error');
    }
  }, [deleteWorkout, setShowWorkoutDetail, showToastMsg, t]);

  return {
    addExerciseToWorkout,
    saveWorkout,
    openWorkoutDetail,
    handleEditWorkout,
    handleDeleteWorkout
  };
} 