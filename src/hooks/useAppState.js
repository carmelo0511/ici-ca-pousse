import { useState, useCallback, useEffect } from 'react';
import { load, save } from '../utils/firebase/storage';
import { STORAGE_KEYS } from '../constants';

export default function useAppState() {
  // État de l'onglet actif
  const [activeTab, setActiveTab] = useState('workout');

  // État des toasts
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  // État de la date sélectionnée
  const [selectedDate, setSelectedDate] = useState(() => {
    const saved = load(STORAGE_KEYS.CURRENT_WORKOUT, {});
    if (saved.selectedDate) return saved.selectedDate;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // États des modals et formulaires
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showWorkoutDetail, setShowWorkoutDetail] = useState(false);
  const [startTime, setStartTime] = useState(() => {
    const saved = load(STORAGE_KEYS.CURRENT_WORKOUT, {});
    return saved.startTime || '';
  });
  const [endTime, setEndTime] = useState(() => {
    const saved = load(STORAGE_KEYS.CURRENT_WORKOUT, {});
    return saved.endTime || '';
  });
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
  const [showMigratePrompt, setShowMigratePrompt] = useState(false);

  // Fonction utilitaire pour les toasts
  const showToastMsg = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: '', type: 'success' }),
      2500
    );
  }, []);

  // Fonction pour nettoyer le formulaire de workout
  const clearWorkoutForm = useCallback(() => {
    setStartTime('');
    setEndTime('');
    setSelectedWorkout(null);
    setShowAddExercise(false);
    setSelectedMuscleGroup(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_WORKOUT);
  }, []);

  useEffect(() => {
    if (!startTime && !endTime) {
      const saved = load(STORAGE_KEYS.CURRENT_WORKOUT, {});
      if (!saved.exercises || saved.exercises.length === 0) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_WORKOUT);
        return;
      }
    }
    const saved = load(STORAGE_KEYS.CURRENT_WORKOUT, {});
    save(STORAGE_KEYS.CURRENT_WORKOUT, {
      ...saved,
      startTime,
      endTime,
      selectedDate,
    });
  }, [startTime, endTime, selectedDate]);

  return {
    // États
    activeTab,
    toast,
    selectedDate,
    showAddExercise,
    selectedWorkout,
    showWorkoutDetail,
    startTime,
    endTime,
    selectedMuscleGroup,
    showMigratePrompt,

    // Setters
    setActiveTab,
    setToast,
    setSelectedDate,
    setShowAddExercise,
    setSelectedWorkout,
    setShowWorkoutDetail,
    setStartTime,
    setEndTime,
    setSelectedMuscleGroup,
    setShowMigratePrompt,

    // Fonctions utilitaires
    showToastMsg,
    clearWorkoutForm,
  };
}
