// Export des modules Firebase
export { default as firebase } from './firebase.js';
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
} from './firebase.js';
export {
  load,
  save,

  migrateLocalWorkoutsToCloud,
} from './storage.js';
