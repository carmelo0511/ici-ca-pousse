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
import { ensureUserProfile } from './utils/firebase';
import { migrateLocalWorkoutsToCloud } from './utils/storage';
import { useTranslation } from 'react-i18next';
import PWAInstallButton from './components/PWAInstallButton';
import FriendsList from './components/FriendsList';

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
  const [showMigratePrompt, setShowMigratePrompt] = useState(false);

  // Hooks personnalisés
  const { workouts, addWorkout, updateWorkout, deleteWorkout, getWorkoutForDate, getStats } = useWorkouts(user);
  const { exercises, addExercise, removeExercise, addSet, updateSet, removeSet, clearExercises, setExercisesFromWorkout } = useExercises();
  const { t } = useTranslation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      setAuthChecked(true);
      if (u) {
        await ensureUserProfile(u);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      // Vérifier s'il y a des données locales à migrer
      const localWorkouts = JSON.parse(localStorage.getItem('iciCaPousse_workouts') || '[]');
      if (localWorkouts.length > 0) {
        setShowMigratePrompt(true);
      }
    }
  }, [user]);

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
    showToastMsg(t('exercise_added'));
  };

  const saveWorkout = async () => {
    if (exercises.length === 0) return;
    // On ne passe l'id que s'il s'agit d'une édition et que l'id est une chaîne (Firestore)
    const workout = createWorkout(
      exercises,
      selectedDate,
      workoutDuration,
      selectedWorkout && typeof selectedWorkout.id === 'string' ? selectedWorkout.id : undefined
    );
    if (selectedWorkout && typeof selectedWorkout.id === 'string') {
      try {
        await updateWorkout(selectedWorkout.id, workout);
        showToastMsg(t('workout_updated'));
      } catch (e) {
        showToastMsg(t('error_update'), 'error');
      }
    } else {
      addWorkout(workout);
      showToastMsg(t('workout_saved'));
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


  const handleDeleteWorkout = async (workoutId) => {
    // On ne supprime que si l'id est une chaîne (Firestore)
    if (typeof workoutId === 'string' && window.confirm(t('confirm_delete_workout'))) {
      try {
        await deleteWorkout(workoutId);
        setShowWorkoutDetail(false);
        showToastMsg(t('workout_deleted'), 'error');
      } catch (e) {
        showToastMsg(t('error_delete'), 'error');
      }
    } else {
      showToastMsg('Suppression impossible : id de séance invalide.', 'error');
    }
  };

  const handleMigrate = async () => {
    await migrateLocalWorkoutsToCloud(user, addWorkout);
    setShowMigratePrompt(false);
    showToastMsg('Migration des séances locales vers le cloud réussie !');
  };

  // Afficher la proposition de migration si besoin
  if (showMigratePrompt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Migration des données</h2>
          <p className="mb-6">Des séances locales ont été détectées. Voulez-vous les transférer sur votre compte cloud pour les retrouver sur tous vos appareils ?</p>
          <button
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 mb-2"
            onClick={handleMigrate}
          >
            Migrer mes séances locales vers le cloud
          </button>
          <button
            className="text-gray-500 underline mt-2"
            onClick={() => setShowMigratePrompt(false)}
          >
            Ignorer
          </button>
        </div>
      </div>
    );
  }

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
      case 'friends':
        return <FriendsList user={user} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto max-w-4xl w-full px-2 sm:px-6 py-4 main-safe-area compact">
        <Header workoutCount={workouts.length} user={user} />
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} tabs={[{id:'workout',label:'Séance'},{id:'calendar',label:'Calendrier'},{id:'stats',label:'Statistiques'},{id:'friends',label:'Amis'}]} />
        {renderActiveTab()}
        {/* Bouton PWA discret, visible tant que l'app n'est pas installée */}
        <PWAInstallButton />
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
}

export default App;