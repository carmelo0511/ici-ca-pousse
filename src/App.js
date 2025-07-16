import React, { useState, useEffect } from 'react';
import './App.css';
import Auth from './components/Auth';
import Header from './components/Header/Header';
import Navigation from './components/Navigation/Navigation';
import WorkoutList from './components/WorkoutList/WorkoutList';
import CalendarView from './components/CalendarView/CalendarView';
import StatsView from './components/StatsView/StatsView';
import { useWorkouts } from './hooks/useWorkouts';
import { useExercises } from './hooks/useExercises';
import { createWorkout } from './utils/workoutUtils';
import { exerciseDatabase } from './utils/exerciseDatabase';
import { auth } from './utils/firebase';

function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState('workout');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showWorkoutDetail, setShowWorkoutDetail] = useState(false);
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);

  // Hooks personnalisés
  const { workouts, addWorkout, updateWorkout, deleteWorkout, getWorkoutForDate, getStats } = useWorkouts();
  const { exercises, addExercise, removeExercise, addSet, updateSet, removeSet, clearExercises, setExercisesFromWorkout } = useExercises();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  if (!authChecked) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  if (!user) {
    return <Auth />;
  }

  // Fonctions utilitaires
  const showToastMsg = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2500);
  };

  const addExerciseToWorkout = (exerciseName) => {
    addExercise(exerciseName);
    setShowAddExercise(false);
    setSelectedMuscleGroup(null);
    showToastMsg('Exercice ajouté à la séance !');
  };

  const saveWorkout = () => {
    if (exercises.length === 0) return;
    const workout = createWorkout(exercises, selectedDate, workoutDuration, selectedWorkout ? selectedWorkout.id : null);
    if (selectedWorkout) {
      updateWorkout(selectedWorkout.id, workout);
      showToastMsg('Séance modifiée avec succès ! 💪');
    } else {
      addWorkout(workout);
      showToastMsg('Séance sauvegardée ! Bien joué ! 🎉');
    }
    clearExercises();
    setWorkoutDuration('');
    setSelectedWorkout(null);
  };

  const openWorkoutDetail = (workout) => {
    setSelectedWorkout(workout);
    setShowWorkoutDetail(true);
  };

  const handleEditWorkout = (workout) => {
    setSelectedWorkout(workout);
    setSelectedDate(workout.date);
    setWorkoutDuration(workout.duration);
    setExercisesFromWorkout(workout.exercises);
    setActiveTab('workout');
  };


  const handleDeleteWorkout = (workoutId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette séance ? 🗑️')) {
      deleteWorkout(workoutId);
      setShowWorkoutDetail(false);
      showToastMsg('Séance supprimée !', 'error');
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'workout':
        return (
          <WorkoutList
            exercises={exercises}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            workoutDuration={workoutDuration}
            setWorkoutDuration={setWorkoutDuration}
            showAddExercise={showAddExercise}
            setShowAddExercise={setShowAddExercise}
            selectedMuscleGroup={selectedMuscleGroup}
            setSelectedMuscleGroup={setSelectedMuscleGroup}
            addExerciseToWorkout={addExerciseToWorkout}
            addSet={addSet}
            updateSet={updateSet}
            removeSet={removeSet}
            removeExercise={removeExercise}
            saveWorkout={saveWorkout}
            exerciseDatabase={exerciseDatabase}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            workouts={workouts}
            getWorkoutForDate={getWorkoutForDate}
            openWorkoutDetail={openWorkoutDetail}
            showWorkoutDetail={showWorkoutDetail}
            selectedWorkout={selectedWorkout}

            deleteWorkout={handleDeleteWorkout}
            setShowWorkoutDetail={setShowWorkoutDetail}
          />
        );
      case 'stats':
        return <StatsView stats={getStats()} workouts={workouts} onEditWorkout={handleEditWorkout} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-6 py-4">
        <Header workoutCount={workouts.length} />
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        {renderActiveTab()}
        {toast.show && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-3 px-6 py-4 rounded-2xl shadow-xl font-semibold text-lg
            ${toast.type === 'success' ? 'bg-white border border-green-200 text-green-700' : 'bg-white border border-red-200 text-red-700'}`}
          >
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
