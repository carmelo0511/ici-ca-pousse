import { STORAGE_KEYS } from '../../constants';
export const load = (key, defaultValue) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (err) {
    console.error('Erreur chargement', err);
    return defaultValue;
  }
};

export const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Erreur sauvegarde', err);
  }
};

export const migrateLocalWorkoutsToCloud = async (user, addWorkoutCloud) => {
  const localWorkouts = load(STORAGE_KEYS.WORKOUTS, []);
  if (user && localWorkouts.length > 0) {
    for (const workout of localWorkouts) {
      const { id, ...workoutWithoutId } = workout;
      await addWorkoutCloud({ ...workoutWithoutId, userId: user.uid });
    }
    // Optionnel : vider le localStorage après migration
    save(STORAGE_KEYS.WORKOUTS, []);
  }
};


