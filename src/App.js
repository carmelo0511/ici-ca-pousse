import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import './App.css';
import Header from './components/Header/Header';
import Navigation from './components/Navigation/Navigation';
import WorkoutList from './components/WorkoutList/WorkoutList';
import CalendarView from './components/CalendarView/CalendarView';
import StatsView from './components/StatsView/StatsView';
import PWAInstallButton from './components/PWAInstallButton/PWAInstallButton';
import PWAStatus from './components/PWAStatus/PWAStatus';
import { useWorkouts } from './hooks/useWorkouts';
import { useExercises } from './hooks/useExercises';
import { createWorkout } from './utils/workoutUtils';
import { exerciseDatabase } from './utils/exerciseDatabase';

const App = () => {
  const [activeTab, setActiveTab] = useState('workout');
  const [showToast, setShowToast] = useState(false);
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
  const { workouts, addWorkout, deleteWorkout, getWorkoutForDate, getStats } = useWorkouts();
  const { exercises, addExercise, removeExercise, addSet, updateSet, removeSet, clearExercises } = useExercises();

  // Fonctions utilitaires
  const addExerciseToWorkout = (exerciseName) => {
    addExercise(exerciseName);
    setShowAddExercise(false);
    setSelectedMuscleGroup(null);
  };

  const saveWorkout = () => {
    if (exercises.length === 0) return;
    const workout = createWorkout(exercises, selectedDate, workoutDuration);
    addWorkout(workout);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
    clearExercises();
    setWorkoutDuration('');
  };

  const openWorkoutDetail = (workout) => {
    setSelectedWorkout(workout);
    setShowWorkoutDetail(true);
  };



  const handleDeleteWorkout = (workoutId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette séance ? 🗑️')) {
      deleteWorkout(workoutId);
      setShowWorkoutDetail(false);
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
        return <StatsView stats={getStats()} workouts={workouts} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header workoutCount={workouts.length} />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="container mx-auto px-4 py-6">
        {renderActiveTab()}
      </main>
      <PWAInstallButton />
      <PWAStatus />
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-zoom-in font-semibold text-lg">
          <CheckCircle className="h-6 w-6 text-white animate-pulse" />
          <span>Séance sauvegardée ! Bien joué ! 🎉</span>
        </div>
      )}
    </div>
  );
};

export default App;
