// React imports
import React, { useState, useEffect } from 'react';

// Third-party imports
import { useTranslation, I18nextProvider } from 'react-i18next';

// Styles
import './App.css';
import './glassmorphism-theme.css';
import './styles/fix-cards-colors.css';
import './styles/ml-dashboard.css';
import './styles/mobile-enhancements.css';
import './utils/checkTailwindColors';

// Core imports
import i18n from './i18n';

// Components
import {
  Auth,
  Header,
  Navigation,
  PWAInstallButton,
  MigrationPrompt,
  ChatbotBubble,
} from './components';

// UI Components
import { LoadingScreen, WeightNotification, AppToast } from './components/UI';
import TabContent from './components/Layout/TabContent';

// Performance Components
import MobileOptimizer from './components/Performance/MobileOptimizer';
import CoreWebVitals from './components/Performance/CoreWebVitals';

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
  useKeyboardNavigation,
  useNotifications,
  useWorkoutTemplates,
} from './hooks';

// Specialized Hooks
import { useAppInitialization } from './hooks/useAppInitialization';
import { useWeightNotification } from './hooks/useWeightNotification';
import { useTemplateActions } from './hooks/useTemplateActions';
import { useStreakRecalculation } from './hooks/useStreakRecalculation';

// Utils
import { migrateLocalWorkoutsToCloud } from './utils/firebase/storage';
import { STORAGE_KEYS } from './constants';

function App() {
  const { user, loading: userLoading, refreshUserProfile } = useUserProfile();
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


  const handleDateSelect = (selectedDate) => {
    setSelectedDate(selectedDate);
    setActiveTab('workout');
    showToastMsg(`Séance créée pour le ${selectedDate} !`);
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
  // useSwipeNavigation(activeTab, setActiveTab, tabs); // Désactivé pour éviter le changement d'onglet par swipe
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

  // Hook pour le recalcul automatique du streak
  useStreakRecalculation(user, workouts, recalculateStreak);


  // Hook pour la notification de poids hebdomadaire
  const { 
    showWeightNotif, 
    isFading, 
    handleUpdateWeight, 
    handleSameWeight 
  } = useWeightNotification(user, setActiveTab, refreshUserProfile);

  // Hook pour l'initialisation de l'app
  useAppInitialization();

  // Hook pour les actions des templates
  const {
    handleSaveTemplate,
    handleDeleteTemplate,
    handleEditTemplate,
    handleLoadTemplate
  } = useTemplateActions({
    saveCurrentWorkoutAsTemplate,
    deleteTemplate,
    updateTemplate,
    clearExercises,
    setExercisesFromWorkout,
    setActiveTab,
    showToastMsg
  });

  // Fonction pour gérer l'envoi de message depuis la bulle
  const handleSendMessageFromBubble = (message) => {
    showToastMsg(`Message envoyé: ${message}`);
  };

  // Écouter l'événement pour déclencher une réponse automatique du chatbot
  useEffect(() => {
    const handleTriggerResponse = async (event) => {
      const userMessage = event.detail.message;
      const eventUser = event.detail.user;
      const eventWorkouts = event.detail.workouts;
      
      // Attendre un peu pour que le message soit bien ajouté
      setTimeout(async () => {
        try {
          // Déclencher un événement pour que le chatbot traite le message
          window.dispatchEvent(new CustomEvent('processChatbotMessage', { 
            detail: { 
              message: userMessage,
              user: eventUser,
              workouts: eventWorkouts
            } 
          }));
        } catch (error) {
          console.error('❌ Erreur lors de la réponse automatique dans App.js:', error);
        }
      }, 500);
    };

    window.addEventListener('triggerChatbotResponse', handleTriggerResponse);
    
    return () => {
      window.removeEventListener('triggerChatbotResponse', handleTriggerResponse);
    };
  }, []);

  if (!authChecked || userLoading) {
    return <LoadingScreen userLoading={userLoading} />;
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
    <I18nextProvider i18n={i18n}>
      <MobileOptimizer>
        {/* Notification hebdo poids */}
        <WeightNotification
          show={showWeightNotif}
          isFading={isFading}
          onUpdateWeight={handleUpdateWeight}
          onSameWeight={handleSameWeight}
        />

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

          {/* Contenu principal avec tabs */}
          <TabContent
            activeTab={activeTab}
            workoutProps={{
              user,
              exercises,
              workouts,
              selectedDate,
              setSelectedDate,
              startTime,
              setStartTime,
              endTime,
              setEndTime,
              addSet,
              updateSet,
              removeSet,
              saveWorkout,
              showAddExercise,
              setShowAddExercise,
              selectedMuscleGroup,
              setSelectedMuscleGroup,
              addExerciseToWorkout,
              removeExerciseFromWorkout,
              onSaveTemplate: handleSaveTemplate
            }}
            calendarProps={{
              workouts,
              getWorkoutForDate,
              openWorkoutDetail,
              showWorkoutDetail,
              selectedWorkout,
              deleteWorkout: handleDeleteWorkout,
              setShowWorkoutDetail,
              onEditWorkout: handleEditWorkout,
              onDateSelect: handleDateSelect
            }}
            statsProps={{
              stats: getStats(),
              workouts,
              user
            }}
            templateProps={{
              templates,
              addTemplate,
              onSaveTemplate: handleSaveTemplate,
              onDeleteTemplate: handleDeleteTemplate,
              onLoadTemplate: handleLoadTemplate,
              onEditTemplate: handleEditTemplate,
              saveCurrentWorkoutAsTemplate,
              cleanProblematicTemplates,
              deleteAllTemplates,
              forceDeleteTemplate,
              exercises,
              showToastMsg
            }}
            leaderboardProps={{
              user,
              showToastMsg,
              setActiveTab,
              setExercisesFromWorkout
            }}
            challengeProps={{
              user
            }}
            badgeProps={{
              workouts,
              challenges,
              friends,
              user,
              addBadgeUnlockXP
            }}
            profileProps={{
              user,
              workouts,
              challenges,
              onUserUpdate: refreshUserProfile,
              addBadgeUnlockXP,
              refreshUserProfile
            }}
          />

          {/* Bouton PWA discret, visible tant que l'app n'est pas installée */}
          <PWAInstallButton />
          <AppToast toast={toast} />
          <ChatbotBubble
            user={user}
            workouts={workouts}
            setExercisesFromWorkout={setExercisesFromWorkout}
            setShowAddExercise={setShowAddExercise}
            setActiveTab={setActiveTab}
            onSendMessage={handleSendMessageFromBubble}
          />

          {/* Vercel Analytics et Speed Insights - Initialized via useEffect */}
        </div>
      </div>
      
      {/* Composants de monitoring des performances */}
      <CoreWebVitals />
    </MobileOptimizer>
    </I18nextProvider>
  );
}
export default App;

