import React, { useState } from 'react';
import {
  Plus,
  Calendar,
  BarChart3,
  Dumbbell,
  Edit,
  Trash2,
  X,
  Heart,
} from 'lucide-react';
import './App.css';
import Header from './components/Header';
import Navigation from './components/Navigation';
import WorkoutList from './components/WorkoutList';
import CalendarView from './components/CalendarView';
import StatsView from './components/StatsView';
import { useWorkouts } from './hooks/useWorkouts';
import { useExercises } from './hooks/useExercises';
import { createWorkout } from './utils/workoutUtils';
import { exerciseDatabase } from './utils/exerciseDatabase';

const App = () => {
  const [activeTab, setActiveTab] = useState('workout');
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
  const [isEditingWorkout, setIsEditingWorkout] = useState(false);
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);

  // Hooks personnalisés
  const { workouts, addWorkout, updateWorkout, deleteWorkout, getWorkoutForDate, getStats } = useWorkouts();
  const { exercises, addExercise, updateExercise, removeExercise, addSet, updateSet, removeSet, clearExercises } = useExercises();

  // Fonctions utilitaires
  const addExerciseToWorkout = (exerciseName) => {
    addExercise(exerciseName);
    setShowAddExercise(false);
    setSelectedMuscleGroup(null);
  };

  const saveWorkout = () => {
    if (exercises.length === 0) return;
    
    const workout = createWorkout(exercises, selectedDate, workoutDuration, isEditingWorkout ? editingWorkoutId : null);
    
    if (isEditingWorkout) {
      updateWorkout(editingWorkoutId, workout);
      setIsEditingWorkout(false);
      setEditingWorkoutId(null);
      alert('Séance modifiée avec succès ! 💪');
    } else {
      addWorkout(workout);
      alert('Séance sauvegardée ! Bien joué ! 🎉');
    }
    
    clearExercises();
    setWorkoutDuration('');
  };

  const openWorkoutDetail = (workout) => {
    setSelectedWorkout(workout);
    setShowWorkoutDetail(true);
  };

  const editWorkout = (workout) => {
    setIsEditingWorkout(true);
    setEditingWorkoutId(workout.id);
    setSelectedDate(workout.date);
    workout.exercises.forEach(ex => addExercise(ex));
    setWorkoutDuration(workout.duration.toString());
    setActiveTab('workout');
    setShowWorkoutDetail(false);
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
            editWorkout={editWorkout}
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
    </div>
  );
};

export default App;
