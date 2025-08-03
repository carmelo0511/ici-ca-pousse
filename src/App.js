// React imports
import React, { useState, useEffect } from 'react';

// Third-party imports
import { useTranslation } from 'react-i18next';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './utils/firebase';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Styles
import './App.css';
import './glassmorphism-theme.css';
import './styles/fix-cards-colors.css';

// Vérification des couleurs Tailwind
import './utils/checkTailwindColors';

// Components
import Auth from './components/Auth';
import Header from './components/Header/Header';
import Navigation from './components/Navigation/Navigation';
import WorkoutList from './components/Workout/WorkoutList/WorkoutList';
import CalendarView from './components/CalendarView/CalendarView';
import StatsView from './components/StatsView/StatsView';
import PWAInstallButton from './components/PWAInstallButton';

import LeaderboardView from './components/Leaderboard/LeaderboardView';
import BadgesPage from './components/Badges/BadgesPage';
import Challenges from './components/Challenges';
import WorkoutTemplates from './components/Workout/WorkoutTemplates';

import MigrationPrompt from './components/MigrationPrompt';
import PageTransition from './components/PageTransition';

import ProfilePage from './components/Profile/ProfilePage';
import ChatbotBubble from './components/Chatbot/ChatbotBubble';

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
  useNotifications,
  useWorkoutTemplates,
} from './hooks';

// Utils
import { migrateLocalWorkoutsToCloud } from './utils/firebase/storage';
import { STORAGE_KEYS } from './constants';
import { initAllGlassEffects } from './utils/glassParticles';

function App() {
  const { user, loading: userLoading, refreshUserProfile } = useUserProfile();
  const [authChecked, setAuthChecked] = useState(false);
  const [showWeightNotif, setShowWeightNotif] = useState(false);
  const [isFading, setIsFading] = useState(false);

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
  const {
    workouts,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkoutForDate,
    getStats,
  } = useWorkouts(user);
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
  const {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    saveCurrentWorkoutAsTemplate,
    cleanProblematicTemplates,
    deleteAllTemplates,
    forceDeleteTemplate,
  } = useWorkoutTemplates(user);
  const {
    addWorkoutXP,
    addBadgeUnlockXP,
    addFriendXP,
    addChallengeSendXP,
    addChallengeWinXP,
    recalculateStreak,
  } = useExperience(user);
  const { challenges } = useChallenges(
    user,
    addChallengeSendXP,
    addChallengeWinXP
  );

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
    workouts,

    user,
  });

  const {
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    saveWorkout,
    openWorkoutDetail,
    handleEditWorkout,
    handleDeleteWorkout,
  } = workoutLogic;

  // Fonctions pour gérer les templates
  const handleSaveTemplate = async (exercises, name, description = '') => {
    try {
      await saveCurrentWorkoutAsTemplate(exercises, name, description);
      setActiveTab('templates'); // Basculer vers l'onglet Templates
      showToastMsg('Template sauvegardé avec succès !');
    } catch (error) {
      console.error('Erreur sauvegarde template:', error);
      showToastMsg('Erreur lors de la sauvegarde du template', 'error');
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      await deleteTemplate(templateId);
      showToastMsg('Template supprimé avec succès !');
    } catch (error) {
      console.error('Erreur suppression template:', error);
      showToastMsg('Erreur lors de la suppression du template', 'error');
    }
  };

  const handleEditTemplate = async (templateId, updatedTemplate) => {
    try {
      await updateTemplate(templateId, updatedTemplate);
      showToastMsg('Template modifié avec succès !');
    } catch (error) {
      console.error('Erreur modification template:', error);
      showToastMsg('Erreur lors de la modification du template', 'error');
    }
  };

  const handleLoadTemplate = (template) => {
    // Convertir le template en exercices pour la séance actuelle
    const templateExercises = template.exercises.map((exercise, index) => ({
      id: Date.now() + index,
      name: exercise.name,
      type: exercise.type,
      sets: exercise.sets.map((set, setIndex) => ({
        id: Date.now() + index * 100 + setIndex,
        reps: set.reps || 0,
        weight: set.weight || 0,
        duration: set.duration || 0,
      })),
    }));

    // Vider les exercices actuels et charger le template
    clearExercises();
    setExercisesFromWorkout(templateExercises);

    // Basculer vers l'onglet séance
    setActiveTab('workout');
    showToastMsg(`Template "${template.name}" chargé !`);
  };

  // Configuration des onglets pour la navigation
  const tabs = [
    { id: 'workout', label: 'Séance' },
    { id: 'calendar', label: 'Calendrier' },
    { id: 'stats', label: 'Statistiques' },
    { id: 'templates', label: 'Templates' },
    { id: 'profile', label: 'Profil' },
    { id: 'leaderboard', label: 'Classement' },
    { id: 'challenges', label: 'Défis' },
    { id: 'badges', label: 'Badges' },
    { id: 'friends', label: 'Amis' },
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
      const localWorkouts = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.WORKOUTS) || '[]'
      );
      if (localWorkouts.length > 0) {
        setShowMigratePrompt(true);
      }
    }
  }, [user, setShowMigratePrompt]);

  // Recalculer le streak au chargement si nécessaire
  useEffect(() => {
    if (user && workouts.length > 0) {
      // Recalculer le streak une fois par jour au maximum
      const lastRecalculation = localStorage.getItem('lastStreakRecalculation');
      const today = new Date().toDateString();

      if (lastRecalculation !== today) {
        recalculateStreak(workouts)
          .then(() => {
            localStorage.setItem('lastStreakRecalculation', today);
          })
          .catch((error) => {
            console.error(
              'Erreur lors du recalcul automatique du streak:',
              error
            );
          });
      }
    }
  }, [user, workouts, recalculateStreak]);

  // Initialize glass effects
  useEffect(() => {
    // Initialize all glass effects with reduced count for performance
    initAllGlassEffects(15);
  }, []);

  // Notification hebdo poids
  useEffect(() => {
    if (!user || !user.uid) return;
    const checkWeightNotif = async () => {
      // Date de la semaine courante (lundi)
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si dimanche, on remonte de 6 jours
      const monday = new Date(now);
      monday.setDate(now.getDate() + daysToMonday);
      monday.setHours(0, 0, 0, 0);
      const weekKey = monday.toISOString().slice(0, 10);
      const weightHistory = user.weightHistory || [];
      const hasEntry = weightHistory.some((w) => w.weekKey === weekKey);
      // Vérifie si la notif a déjà été affichée cette semaine
      const lastNotifWeek = localStorage.getItem('weightNotifLastWeekKey');
      if (!hasEntry && lastNotifWeek !== weekKey) {
        setShowWeightNotif(true);
        localStorage.setItem('weightNotifLastWeekKey', weekKey);
      }
    };
    checkWeightNotif();
  }, [user]);

  // Action 'C'est le même'
  const handleSameWeight = async () => {
    if (!user || !user.uid) return;
    setIsFading(true);
    setTimeout(() => setShowWeightNotif(false), 400);
    // Date de la semaine courante (lundi)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si dimanche, on remonte de 6 jours
    const monday = new Date(now);
    monday.setDate(now.getDate() + daysToMonday);
    monday.setHours(0, 0, 0, 0);
    const weekKey = monday.toISOString().slice(0, 10);
    const weightHistory = user.weightHistory || [];
    const last =
      weightHistory.length > 0 ? weightHistory[weightHistory.length - 1] : null;
    if (last && last.weekKey !== weekKey) {
      const userRef = doc(db, 'users', user.uid);
      const newHistory = [...weightHistory, { weekKey, value: last.value }];
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
    setActiveTab('profile');
  };

  if (!authChecked || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-600 mb-4">
            Chargement...
          </div>
          <div className="text-sm text-gray-500">
            {userLoading
              ? 'Chargement du profil...'
              : "Vérification de l'authentification..."}
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
      <MigrationPrompt
        onMigrate={handleMigrate}
        onIgnore={() => setShowMigratePrompt(false)}
      />
    );
  }

  return (
    <>
      {/* Notification hebdo poids */}
      {showWeightNotif && (
        <div
          className={`toast-notification flex flex-col items-center gap-2 transition-opacity duration-400 ${isFading ? 'opacity-0' : 'opacity-100'}`}
        >
          <div className="section-title text-lg mb-1">
            Mise à jour du poids
          </div>
          <div className="text-secondary mb-2">
            C'est le début d'une nouvelle semaine !<br />
            Veux-tu mettre à jour ton poids ?
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleUpdateWeight}
              className="btn-primary ripple-effect px-4 py-1 font-medium"
            >
              Mettre à jour
            </button>
            <button
              onClick={handleSameWeight}
              className="btn-secondary ripple-effect px-4 py-1 font-medium"
            >
              C'est le même
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen w-full">
        <div
          id="main-content"
          className="main-container mx-auto max-w-4xl w-full px-2 sm:px-6 py-4 main-safe-area compact"
        >
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
          <Navigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            notifications={notifications}
          />

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
                onSaveTemplate={handleSaveTemplate}
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

            {/* Onglet Templates */}
            <PageTransition isActive={activeTab === 'templates'}>
              <WorkoutTemplates
                templates={templates}
                addTemplate={addTemplate}
                onSaveTemplate={handleSaveTemplate}
                onDeleteTemplate={handleDeleteTemplate}
                onLoadTemplate={handleLoadTemplate}
                onEditTemplate={handleEditTemplate}
                saveCurrentWorkoutAsTemplate={saveCurrentWorkoutAsTemplate}
                cleanProblematicTemplates={cleanProblematicTemplates}
                deleteAllTemplates={deleteAllTemplates}
                forceDeleteTemplate={forceDeleteTemplate}
                exercises={exercises}
                showToastMsg={showToastMsg}
              />
            </PageTransition>

            {/* Onglet Classement */}
            <PageTransition isActive={activeTab === 'leaderboard'}>
              <LeaderboardView 
                user={user} 
                showToastMsg={showToastMsg}
                setActiveTab={setActiveTab}
                setExercisesFromWorkout={setExercisesFromWorkout}
              />
            </PageTransition>

            {/* Onglet Défis */}
            <PageTransition isActive={activeTab === 'challenges'}>
              <Challenges user={user} />
            </PageTransition>

            {/* Onglet Badges */}
            <PageTransition isActive={activeTab === 'badges'}>
              <BadgesPage
                workouts={workouts}
                challenges={challenges}
                friends={friends}
                user={user}
                addBadgeUnlockXP={addBadgeUnlockXP}
              />
            </PageTransition>

            {/* Onglet Profil */}
            <PageTransition isActive={activeTab === 'profile'}>
              <ProfilePage
                user={user}
                workouts={workouts}
                challenges={challenges}
                onUserUpdate={refreshUserProfile}
                addBadgeUnlockXP={addBadgeUnlockXP}
                refreshUserProfile={refreshUserProfile}
              />
            </PageTransition>
          </div>

          {/* Bouton PWA discret, visible tant que l'app n'est pas installée */}
          <PWAInstallButton />
          {toast.show && (
            <div
              className={`toast-notification ${toast.type === 'success' ? 'badge-success' : 'badge-danger'}`}
            >
              <span>{toast.message}</span>
            </div>
          )}
          <ChatbotBubble
            user={user}
            workouts={workouts}
            setExercisesFromWorkout={setExercisesFromWorkout}
            setShowAddExercise={setShowAddExercise}
            setActiveTab={setActiveTab}
          />

          {/* Vercel Analytics et Speed Insights */}
          <Analytics />
          <SpeedInsights />
        </div>
      </div>
    </>
  );
}

export default App;
