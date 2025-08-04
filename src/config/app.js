// Configuration des onglets pour la navigation
export const TAB_CONFIG = [
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

// Messages d'état de chargement
export const LOADING_MESSAGES = {
  AUTH_CHECK: "Vérification de l'authentification...",
  PROFILE_LOADING: 'Chargement du profil...',
  GENERAL_LOADING: 'Chargement...',
};

// Messages de toasts par défaut
export const TOAST_MESSAGES = {
  TEMPLATE_SAVED: 'Template sauvegardé avec succès !',
  TEMPLATE_DELETED: 'Template supprimé avec succès !',
  TEMPLATE_UPDATED: 'Template modifié avec succès !',
  TEMPLATE_LOADED: (name) => `Template "${name}" chargé !`,
  WORKOUT_CREATED_FOR_DATE: (date) => `Séance créée pour le ${date} !`,
  MIGRATION_SUCCESS: 'Migration des séances locales vers le cloud réussie !',
  TEMPLATE_SAVE_ERROR: 'Erreur lors de la sauvegarde du template',
  TEMPLATE_DELETE_ERROR: 'Erreur lors de la suppression du template',
  TEMPLATE_UPDATE_ERROR: 'Erreur lors de la modification du template',
};

// Configuration des effets de verre
export const GLASS_EFFECTS_CONFIG = {
  PARTICLE_COUNT: 15, // Nombre réduit pour les performances
};

// Configuration des recalculs de streak
export const STREAK_CONFIG = {
  STORAGE_KEY: 'lastStreakRecalculation',
};

// Configuration des notifications de poids
export const WEIGHT_NOTIFICATION_CONFIG = {
  STORAGE_KEY: 'weightNotifLastWeekKey',
  FADE_DURATION: 400, // millisecondes
};

// Classes CSS communes
export const CSS_CLASSES = {
  LOADING_CONTAINER: 'flex items-center justify-center min-h-screen',
  LOADING_TEXT: 'text-center',
  LOADING_TITLE: 'text-2xl font-bold text-indigo-600 mb-4',
  LOADING_SUBTITLE: 'text-sm text-gray-500',
  MAIN_CONTAINER: 'min-h-screen w-full',
  CONTENT_CONTAINER: 'main-container mx-auto max-w-4xl w-full px-2 sm:px-6 py-4 main-safe-area compact',
  TOAST_BASE: 'toast-notification',
  TOAST_SUCCESS: 'badge-success',
  TOAST_ERROR: 'badge-danger',
  WEIGHT_NOTIFICATION: 'toast-notification flex flex-col items-center gap-2 transition-opacity duration-400',
  WEIGHT_NOTIFICATION_TITLE: 'section-title text-lg mb-1',
  WEIGHT_NOTIFICATION_TEXT: 'text-secondary mb-2',
  WEIGHT_NOTIFICATION_BUTTONS: 'flex gap-3',
  WEIGHT_BUTTON_PRIMARY: 'btn-primary ripple-effect px-4 py-1 font-medium',
  WEIGHT_BUTTON_SECONDARY: 'btn-secondary ripple-effect px-4 py-1 font-medium',
};