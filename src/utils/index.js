// Export des modules utilitaires généraux
export { default as notifications } from './notifications.js';
export { default as badges } from './badges.js';
export { default as leaderboardUtils } from './leaderboardUtils.js';

// Export des modules AI
export { default as aiMonitoring } from './ai/aiMonitoring.js';
export { default as knowledgeBase } from './ai/knowledgeBase.js';
export { default as safetyValidator } from './ai/safetyValidator.js';
export { default as openaiFunctions } from './ai/openaiFunctions.js';

// Export des modules Firebase
export {
  auth,
  googleProvider,
  db,
  ensureUserProfile,
  createChallengeInFirebase,
  getChallengesFromFirebase,
  updateChallengeInFirebase,
  deleteChallengeFromFirebase,
  uploadProfilePicture,
  deleteProfilePicture,
  saveUserBadges,
  getUserBadges,
  getUserProfile,
} from './firebase/firebase.js';
export {
  load,
  save,

  migrateLocalWorkoutsToCloud,
} from './firebase/storage.js';

// Export des modules Workout
export { default as workoutUtils } from './workout/workoutUtils.js';
export { default as exerciseDatabase } from './workout/exerciseDatabase.js';
