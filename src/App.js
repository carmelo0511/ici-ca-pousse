import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Navigation from './components/Navigation';
import WorkoutList from './components/WorkoutList';
import CalendarView from './components/CalendarView';
import StatsView from './components/StatsView';
import { useWorkouts } from './hooks/useWorkouts';
import { useExercises } from './hooks/useExercises';
import { createWorkout, getCurrentDate } from './utils/workoutUtils';
import { MESSAGES } from './constants';

const App = () => {
  const [activeTab, setActiveTab] = useState('workout');
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showWorkoutDetail, setShowWorkoutDetail] = useState(false);
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [isEditingWorkout, setIsEditingWorkout] = useState(false);
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);

  // Hooks personnalisés
  const { 
    workouts, 
    addWorkout, 
    updateWorkout, 
    deleteWorkout, 
    getWorkoutForDate, 
    getStats 
  } = useWorkouts();

  const {
    exercises,
    selectedMuscleGroup,
    setSelectedMuscleGroup,
    addExerciseToWorkout,
    addSet,
    updateSet,
    removeSet,
    clearExercises,
    setExercisesFromWorkout
  } = useExercises();

  // Gestion des workouts
  const handleSaveWorkout = () => {
    const workout = createWorkout(exercises, selectedDate, workoutDuration, editingWorkoutId);
    
    if (!workout) return;

    if (isEditingWorkout) {
      updateWorkout(editingWorkoutId, workout);
      setIsEditingWorkout(false);
      setEditingWorkoutId(null);
      alert(MESSAGES.WORKOUT_UPDATED);
    } else {
      addWorkout(workout);
      alert(MESSAGES.WORKOUT_SAVED);
    }
    
    clearExercises();
    setWorkoutDuration('');
  };

  const handleEditWorkout = (workout) => {
    setIsEditingWorkout(true);
    setEditingWorkoutId(workout.id);
    setSelectedDate(workout.date);
    setExercisesFromWorkout(workout.exercises);
    setWorkoutDuration(workout.duration.toString());
    setActiveTab('workout');
    setShowWorkoutDetail(false);
  };

  const handleDeleteWorkout = (workoutId) => {
    if (window.confirm(MESSAGES.DELETE_CONFIRMATION)) {
      deleteWorkout(workoutId);
      setShowWorkoutDetail(false);
    }
  };

  const handleOpenWorkoutDetail = (workout) => {
    setSelectedWorkout(workout);
    setShowWorkoutDetail(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <Header workoutCount={workouts.length} />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-6xl mx-auto">
        {activeTab === 'workout' && (
          <WorkoutList
            isEditingWorkout={isEditingWorkout}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            exercises={exercises}
            addSet={addSet}
            updateSet={updateSet}
            removeSet={removeSet}
            saveWorkout={handleSaveWorkout}
            workoutDuration={workoutDuration}
            setWorkoutDuration={setWorkoutDuration}
            showAddExercise={showAddExercise}
            setShowAddExercise={setShowAddExercise}
            selectedMuscleGroup={selectedMuscleGroup}
            setSelectedMuscleGroup={setSelectedMuscleGroup}
            addExerciseToWorkout={addExerciseToWorkout}
          />
        )}
        
        {activeTab === 'calendar' && (
          <CalendarView
            workouts={workouts}
            getWorkoutForDate={getWorkoutForDate}
            openWorkoutDetail={handleOpenWorkoutDetail}
            showWorkoutDetail={showWorkoutDetail}
            selectedWorkout={selectedWorkout}
            editWorkout={handleEditWorkout}
            deleteWorkout={handleDeleteWorkout}
            setShowWorkoutDetail={setShowWorkoutDetail}
          />
        )}
        
        {activeTab === 'stats' && (
          <StatsView stats={getStats()} workouts={workouts} />
        )}
      </main>
    </div>
  );
};

export default App;
