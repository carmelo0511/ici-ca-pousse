import { useCallback } from 'react';
import { createWorkout } from '../utils/workoutUtils';
import { STORAGE_KEYS } from '../constants';

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
  removeExercise,
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
  workouts,
  setMessages,
  user,
}) {
  // Ajout d'un exercice à la séance
  const addExerciseToWorkout = useCallback(
    (exerciseName, muscleGroup = null) => {
      // S'assurer qu'on n'est pas en mode édition quand on ajoute un exercice
      setSelectedWorkout(null);
      addExercise(exerciseName, muscleGroup);
      setShowAddExercise(false);
      setSelectedMuscleGroup(null);
      showToastMsg(t('exercise_added'));
    },
    [
      addExercise,
      setShowAddExercise,
      setSelectedMuscleGroup,
      setSelectedWorkout,
      showToastMsg,
      t,
    ]
  );

  // Suppression d'un exercice de la séance
  const removeExerciseFromWorkout = useCallback(
    (exerciseId) => {
      removeExercise(exerciseId);
      showToastMsg(t('exercise_removed'));
    },
    [removeExercise, showToastMsg, t]
  );

  // Sauvegarde d'une séance
  const saveWorkout = useCallback(async () => {
    if (!exercises || exercises.length === 0) {
      showToastMsg(t('no_exercises_to_save'), 'error');
      return;
    }

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
      selectedWorkout && selectedWorkout.id != null
        ? selectedWorkout.id
        : undefined,
      startTime,
      endTime
    );

    if (!workout) {
      showToastMsg(t('workout_creation_error'), 'error');
      return;
    }

    try {
      // Vérifier si on est vraiment en mode édition avec un workout valide
      if (selectedWorkout && selectedWorkout.id != null) {
        await updateWorkout(selectedWorkout.id, workout);
        showToastMsg(t('workout_updated'));
      } else {
        // Mode création d'un nouveau workout
        await addWorkout(workout);
        // Ajouter de l'XP pour la nouvelle séance
        if (addWorkoutXP) {
          try {
            const previousWorkouts = workouts.slice(-5); // Derniers 5 workouts pour le calcul du streak
            const result = await addWorkoutXP(workout, previousWorkouts);
            if (result && result.levelUp) {
              showToastMsg(
                `🎉 Niveau ${result.newLevel} atteint ! ${result.newLevelName}`,
                'success'
              );
            } else if (result && result.streakIncreased) {
              showToastMsg(
                `🔥 Streak +1 ! ${result.newStreak} jours !`,
                'success'
              );
            } else {
              showToastMsg(
                `+${result?.xpGained || 0} XP gagné ! 💪`,
                'success'
              );
            }
          } catch (error) {
            console.error("Erreur lors de l'ajout d'XP:", error);
            // Ne pas bloquer la sauvegarde si l'XP échoue
          }
        }
        
        // Envoyer un message de félicitations du chatbot
        try {
          const { sendCongratsAfterWorkout } = await import('../components/Chatbot/sendCongratsAfterWorkout');
          sendCongratsAfterWorkout({ user, workout, workouts, setMessages });
        } catch (error) {
          console.error("Erreur lors de l'envoi du message de félicitations:", error);
          // Ne pas bloquer la sauvegarde si le message échoue
        }
        
        showToastMsg(t('workout_saved'));
      }

      // Nettoyer le formulaire seulement si la sauvegarde réussit
      clearExercises();
      setStartTime('');
      setEndTime('');
      setSelectedWorkout(null);
      setShowWorkoutDetail(false);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_WORKOUT);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showToastMsg(t('workout_save_error'), 'error');
    }
  }, [
    exercises,
    selectedDate,
    startTime,
    endTime,
    selectedWorkout,
    addWorkout,
    updateWorkout,
    clearExercises,
    setStartTime,
    setEndTime,
    setSelectedWorkout,
    setShowWorkoutDetail,
    showToastMsg,
    t,
    addWorkoutXP,
    workouts,
  ]);

  // Ouvre le détail d'une séance
  const openWorkoutDetail = useCallback(
    (workout) => {
      setSelectedWorkout(workout);
      setShowWorkoutDetail(true);
    },
    [setSelectedWorkout, setShowWorkoutDetail]
  );

  // Prépare l'édition d'une séance
  const handleEditWorkout = useCallback(
    (workout) => {
      setSelectedWorkout(workout);
      setSelectedDate(workout.date);
      setStartTime(workout.startTime);
      setEndTime(workout.endTime);
      setExercisesFromWorkout(workout.exercises);
      setActiveTab('workout');
    },
    [
      setSelectedWorkout,
      setSelectedDate,
      setStartTime,
      setEndTime,
      setExercisesFromWorkout,
      setActiveTab,
    ]
  );

  // Suppression d'une séance
  const handleDeleteWorkout = useCallback(
    async (workoutId) => {
      if (
        typeof workoutId === 'string' &&
        window.confirm(t('confirm_delete_workout'))
      ) {
        try {
          await deleteWorkout(workoutId);
          setShowWorkoutDetail(false); // Fermer la modale après suppression
          showToastMsg(t('workout_deleted'), 'success');
        } catch (e) {
          showToastMsg(t('error_delete'), 'error');
        }
      } else {
        showToastMsg(
          'Suppression impossible : id de séance invalide.',
          'error'
        );
      }
    },
    [deleteWorkout, setShowWorkoutDetail, showToastMsg, t]
  );

  return {
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    saveWorkout,
    openWorkoutDetail,
    handleEditWorkout,
    handleDeleteWorkout,
  };
}
