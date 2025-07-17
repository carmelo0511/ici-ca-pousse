import React, { useState, useEffect } from 'react';
import './App.css';
import Auth from './components/Auth';
import Header from './components/Header/Header';
import Navigation from './components/Navigation/Navigation';
import WorkoutList from './components/Workout/WorkoutList/WorkoutList';
import CalendarView from './components/CalendarView/CalendarView';
import StatsView from './components/StatsView/StatsView';
import { useWorkouts } from './hooks/useWorkouts';
import { useExercises } from './hooks/useExercises';
import { useFriends } from './hooks/useFriends';
import { useChallenges } from './hooks/useChallenges';
import { useUserProfile } from './hooks/useUserProfile';
// createWorkout est maintenant utilisé dans useWorkoutLogic


import { migrateLocalWorkoutsToCloud } from './utils/storage';
import { useTranslation } from 'react-i18next';
import PWAInstallButton from './components/PWAInstallButton';
import FriendsList from './components/Profile/FriendsList';
import LeaderboardView from './components/Leaderboard/LeaderboardView';
import BadgesPage from './components/Badges/BadgesPage';
import Challenges from './components/Challenges';
import Notifications from './components/Notifications';
import MigrationPrompt from './components/MigrationPrompt';
import useWorkoutLogic from './hooks/useWorkoutLogic';
import useAppState from './hooks/useAppState';
import { useExperience } from './hooks/useExperience';
import PageTransition from './components/PageTransition';
import { useSwipeNavigation } from './hooks/useSwipeNavigation';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { useNotifications } from './hooks/useNotifications';

function App() {
  const { user, loading: userLoading } = useUserProfile();
  const [authChecked, setAuthChecked] = useState(false);
  
  // Hook personnalisé pour l'état global
  const appState = useAppState();
  const {
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
    setActiveTab,
    setSelectedDate,
    setShowAddExercise,
    setSelectedWorkout,
    setShowWorkoutDetail,
    setStartTime,
    setEndTime,
    setSelectedMuscleGroup,
    setShowMigratePrompt,
    showToastMsg,
    // clearWorkoutForm est disponible si nécessaire
  } = appState;

  // Hooks personnalisés
  const { workouts, addWorkout, updateWorkout, deleteWorkout, getWorkoutForDate, getStats } = useWorkouts(user);
  const { exercises, addExercise, addSet, updateSet, removeSet, clearExercises, setExercisesFromWorkout } = useExercises();
  const { addWorkoutXP, addBadgeUnlockXP, addFriendXP, addChallengeSendXP, addChallengeWinXP } = useExperience(user);
  const { challenges } = useChallenges(user, addChallengeSendXP, addChallengeWinXP);
  const { friends } = useFriends(user, addFriendXP);
  const { notifications } = useNotifications(user);
  const { t } = useTranslation();

  // Hook personnalisé pour la logique des workouts
  const workoutLogic = useWorkoutLogic({
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
  });

  const { addExerciseToWorkout, saveWorkout, openWorkoutDetail, handleEditWorkout, handleDeleteWorkout } = workoutLogic;

  // Configuration des onglets pour la navigation
  const tabs = [
    { id: 'workout', label: 'Séance' },
    { id: 'calendar', label: 'Calendrier' },
    { id: 'stats', label: 'Statistiques' },
    { id: 'friends', label: 'Amis' },
    { id: 'leaderboard', label: 'Classement' },
    { id: 'challenges', label: 'Défis' },
    { id: 'badges', label: 'Badges' },
    { id: 'notifications', label: 'Notifications' }
  ];

  // Navigation par gestes et raccourcis clavier
  useSwipeNavigation(activeTab, setActiveTab, tabs);
  useKeyboardNavigation(activeTab, setActiveTab, tabs);

  useEffect(() => {
    if (user) {
      setAuthChecked(true);
      // ensureUserProfile est maintenant géré dans useUserProfile
    } else if (!userLoading) {
      setAuthChecked(true);
    }
  }, [user, userLoading]);

  useEffect(() => {
    if (user) {
      // Vérifier s'il y a des données locales à migrer
      const localWorkouts = JSON.parse(localStorage.getItem('iciCaPousse_workouts') || '[]');
      if (localWorkouts.length > 0) {
        setShowMigratePrompt(true);
      }
    }
  }, [user, setShowMigratePrompt]);

  if (!authChecked || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-600 mb-4">Chargement...</div>
          <div className="text-sm text-gray-500">
            {userLoading ? 'Chargement du profil...' : 'Vérification de l\'authentification...'}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const handleMigrate = async () => {
    await migrateLocalWorkoutsToCloud(user, addWorkout);
    setShowMigratePrompt(false);
    showToastMsg('Migration des séances locales vers le cloud réussie !');
  };

  // Afficher la proposition de migration si besoin
  if (showMigratePrompt) {
    return (
      <MigrationPrompt onMigrate={handleMigrate} onIgnore={() => setShowMigratePrompt(false)} />
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'workout':
        return (
          <PageTransition key="workout">
            <WorkoutList
              user={user}
              exercises={exercises}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              startTime={startTime}
              setStartTime={setStartTime}
              endTime={endTime}
              setEndTime={setEndTime}
              addSet={addSet}
              updateSet={updateSet}
              removeSet={removeSet}
              saveWorkout={saveWorkout}
              showAddExercise={showAddExercise}
              setShowAddExercise={setShowAddExercise}
              selectedMuscleGroup={selectedMuscleGroup}
              setSelectedMuscleGroup={setSelectedMuscleGroup}
              addExerciseToWorkout={addExerciseToWorkout}
            />
          </PageTransition>
        );
      case 'calendar':
        return (
          <PageTransition key="calendar">
            <CalendarView
              workouts={workouts}
              getWorkoutForDate={getWorkoutForDate}
              openWorkoutDetail={openWorkoutDetail}
              showWorkoutDetail={showWorkoutDetail}
              selectedWorkout={selectedWorkout}
              deleteWorkout={handleDeleteWorkout}
              setShowWorkoutDetail={setShowWorkoutDetail}
            />
          </PageTransition>
        );
      case 'stats':
        return (
          <PageTransition key="stats">
            <StatsView stats={getStats()} workouts={workouts} onEditWorkout={handleEditWorkout} />
          </PageTransition>
        );
      case 'friends':
        return (
          <PageTransition key="friends">
            <FriendsList user={user} />
          </PageTransition>
        );
      case 'leaderboard':
        return (
          <PageTransition key="leaderboard">
            <LeaderboardView user={user} />
          </PageTransition>
        );
      case 'challenges':
        return (
          <PageTransition key="challenges">
            <Challenges user={user} />
          </PageTransition>
        );
      case 'badges':
        return (
          <PageTransition key="badges">
            <BadgesPage workouts={workouts} challenges={challenges} friends={friends} user={user} addBadgeUnlockXP={addBadgeUnlockXP} />
          </PageTransition>
        );
      case 'notifications':
        return (
          <PageTransition key="notifications">
            <Notifications user={user} />
          </PageTransition>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
      <div id="main-content" className="mx-auto max-w-4xl w-full px-2 sm:px-6 py-4 main-safe-area compact">
        <Header 
          workoutCount={workouts.length} 
          user={user} 
          workouts={workouts} 
          challenges={challenges}
          addBadgeUnlockXP={addBadgeUnlockXP}
          onUserUpdate={(updatedUser) => {
            // Mettre à jour l'utilisateur dans l'état global
            // Note: setUser n'est plus disponible car on utilise useUserProfile
            // Les changements sont gérés automatiquement par le hook
          }}
        />
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} notifications={notifications} />
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