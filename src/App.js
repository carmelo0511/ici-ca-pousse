// React imports
import React, { useState, useEffect } from 'react';

// Third-party imports
import { useTranslation } from 'react-i18next';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './utils/firebase';

// Styles
import './App.css';

// Components
import Auth from './components/Auth';
import Header from './components/Header/Header';
import Navigation from './components/Navigation/Navigation';
import WorkoutList from './components/Workout/WorkoutList/WorkoutList';
import CalendarView from './components/CalendarView/CalendarView';
import StatsView from './components/StatsView/StatsView';
import PWAInstallButton from './components/PWAInstallButton';
import FriendsList from './components/Profile/FriendsList';
import LeaderboardView from './components/Leaderboard/LeaderboardView';
import BadgesPage from './components/Badges/BadgesPage';
import Challenges from './components/Challenges';
import Notifications from './components/Notifications';
import MigrationPrompt from './components/MigrationPrompt';
import PageTransition from './components/PageTransition';
import Chatbot from './components/Chatbot/Chatbot';
import ProfileSettings from './components/Profile/ProfileSettings';

// Hooks
import {
  useWorkouts,
  useExercises,
  useFriends,
  useChallenges,
  useUserProfile,
  useWorkoutLogic,
  useAppState,
  useExperience,
  useSwipeNavigation,
  useKeyboardNavigation,
  useNotifications
} from './hooks';

// Utils
import { migrateLocalWorkoutsToCloud } from './utils/storage';
import { STORAGE_KEYS } from './constants';

function App() {
  const { user, loading: userLoading, refreshUserProfile } = useUserProfile();
  const [authChecked, setAuthChecked] = useState(false);
  const [showWeightNotif, setShowWeightNotif] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
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
  const {
    exercises,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    removeSet,
    clearExercises,
    setExercisesFromWorkout,
  } = useExercises();
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
    workouts
  });

  const {
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    saveWorkout,
    openWorkoutDetail,
    handleEditWorkout,
    handleDeleteWorkout,
  } = workoutLogic;

  // Configuration des onglets pour la navigation
  const tabs = [
    { id: 'workout', label: 'Séance' },
    { id: 'calendar', label: 'Calendrier' },
    { id: 'stats', label: 'Statistiques' },
    { id: 'chatbot', label: 'Chatbot' },
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
      const localWorkouts = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKOUTS) || '[]');
      if (localWorkouts.length > 0) {
        setShowMigratePrompt(true);
      }
    }
  }, [user, setShowMigratePrompt]);

  // Notification hebdo poids
  useEffect(() => {
    if (!user || !user.uid) return;
    const checkWeightNotif = async () => {
      // Date de la semaine courante (lundi)
      const now = new Date();
      const monday = new Date(now.setDate(now.getDate() - now.getDay() + 1));
      monday.setHours(0,0,0,0);
      const weekKey = monday.toISOString().slice(0,10);
      const weightHistory = user.weightHistory || [];
      const hasEntry = weightHistory.some(w => w.weekKey === weekKey);
      // Vérifie si la notif a déjà été affichée cette semaine
      const lastNotifWeek = localStorage.getItem('weightNotifLastWeekKey');
      if (!hasEntry && lastNotifWeek !== weekKey) {
        setShowWeightNotif(true);
        localStorage.setItem('weightNotifLastWeekKey', weekKey);
      }
    };
    checkWeightNotif();
  }, [user]);

  // DEBUG : log weightHistory à chaque render
  React.useEffect(() => {
    if (user && user.weightHistory) {
      console.log('weightHistory:', user.weightHistory);
    }
  }, [user]);

  // Action 'C'est le même'
  const handleSameWeight = async () => {
    if (!user || !user.uid) return;
    setIsFading(true);
    setTimeout(() => setShowWeightNotif(false), 400);
    // Date de la semaine courante (lundi)
    const now = new Date();
    const monday = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    monday.setHours(0,0,0,0);
    const weekKey = monday.toISOString().slice(0,10);
    const weightHistory = user.weightHistory || [];
    const last = weightHistory.length > 0 ? weightHistory[weightHistory.length-1] : null;
    if (last && last.weekKey !== weekKey) {
      const userRef = doc(db, 'users', user.uid);
      const newHistory = [...weightHistory, { weekKey, value: last.value }];
      console.log('Ajout dans weightHistory:', newHistory);
      await updateDoc(userRef, { weightHistory: newHistory });
      if (refreshUserProfile) await refreshUserProfile();
    } else {
      // Force refresh même si rien n'est ajouté
      if (refreshUserProfile) await refreshUserProfile();
    }
  };

  // Action 'Mettre à jour' (ouvre le profil)
  const handleUpdateWeight = () => {
    setIsFading(true);
    setTimeout(() => setShowWeightNotif(false), 400);
    setShowProfileModal(true);
  };

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

  return (
    <>
      {/* Notification hebdo poids */}
      {showWeightNotif && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white border border-indigo-300 shadow-lg rounded-xl px-6 py-4 flex flex-col items-center gap-2 animate-fadein transition-opacity duration-400 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
          <div className="font-bold text-indigo-700 text-lg mb-1">Mise à jour du poids</div>
          <div className="text-gray-700 mb-2">C'est le début d'une nouvelle semaine !<br/>Veux-tu mettre à jour ton poids ?</div>
          <div className="flex gap-3">
            <button onClick={handleUpdateWeight} className="px-4 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors font-medium">Mettre à jour</button>
            <button onClick={handleSameWeight} className="px-4 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors font-medium">C'est le même</button>
          </div>
        </div>
      )}
      {/* Modal profil global */}
      {user && (
        <ProfileSettings
          user={user}
          workouts={workouts}
          challenges={challenges}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onUserUpdate={refreshUserProfile}
          addBadgeUnlockXP={addBadgeUnlockXP}
          refreshUserProfile={refreshUserProfile}
        />
      )}
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <div id="main-content" className="mx-auto max-w-4xl w-full px-2 sm:px-6 py-4 main-safe-area compact">
          <Header 
            workoutCount={workouts.length} 
            user={user} 
            workouts={workouts} 
            challenges={challenges}
            addBadgeUnlockXP={addBadgeUnlockXP}
            refreshUserProfile={refreshUserProfile}
            onUserUpdate={(updatedUser) => {
              // Mettre à jour l'utilisateur dans l'état global
              // Note: setUser n'est plus disponible car on utilise useUserProfile
              // Les changements sont gérés automatiquement par le hook
            }}
          />
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} notifications={notifications} />
          
          {/* Conteneur pour tous les onglets avec position relative */}
          <div className="relative">
            {/* Onglet Séance */}
            <PageTransition isActive={activeTab === 'workout'}>
              <WorkoutList
                user={user}
                exercises={exercises}
                workouts={workouts}
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
                removeExerciseFromWorkout={removeExerciseFromWorkout}
              />
            </PageTransition>

            {/* Onglet Calendrier */}
            <PageTransition isActive={activeTab === 'calendar'}>
              <CalendarView
                workouts={workouts}
                getWorkoutForDate={getWorkoutForDate}
                openWorkoutDetail={openWorkoutDetail}
                showWorkoutDetail={showWorkoutDetail}
                selectedWorkout={selectedWorkout}
                deleteWorkout={handleDeleteWorkout}
                setShowWorkoutDetail={setShowWorkoutDetail}
                onEditWorkout={handleEditWorkout}
              />
            </PageTransition>

            {/* Onglet Statistiques */}
            <PageTransition isActive={activeTab === 'stats'}>
            <StatsView stats={getStats()} workouts={workouts} user={user} />
            </PageTransition>

            {/* Onglet Chatbot */}
            <PageTransition isActive={activeTab === 'chatbot'}>
              <Chatbot workouts={workouts} user={user} />
            </PageTransition>

            {/* Onglet Amis */}
            <PageTransition isActive={activeTab === 'friends'}>
              <FriendsList user={user} />
            </PageTransition>

            {/* Onglet Classement */}
            <PageTransition isActive={activeTab === 'leaderboard'}>
              <LeaderboardView user={user} />
            </PageTransition>

            {/* Onglet Défis */}
            <PageTransition isActive={activeTab === 'challenges'}>
              <Challenges user={user} />
            </PageTransition>

            {/* Onglet Badges */}
            <PageTransition isActive={activeTab === 'badges'}>
              <BadgesPage workouts={workouts} challenges={challenges} friends={friends} user={user} addBadgeUnlockXP={addBadgeUnlockXP} />
            </PageTransition>

            {/* Onglet Notifications */}
            <PageTransition isActive={activeTab === 'notifications'}>
              <Notifications user={user} />
            </PageTransition>
          </div>

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
    </>
  );
}

export default App;