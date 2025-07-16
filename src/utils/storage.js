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
  const localWorkouts = load('iciCaPousse_workouts', []);
  if (user && localWorkouts.length > 0) {
    for (const workout of localWorkouts) {
      await addWorkoutCloud({ ...workout, userId: user.uid });
    }
    // Optionnel : vider le localStorage après migration
    save('iciCaPousse_workouts', []);
  }
};

export const migrateLocalFavoritesToCloud = async (user, setFavoriteCloud) => {
  const localFavorites = load('favoriteExercises', []);
  if (user && localFavorites.length > 0) {
    await setFavoriteCloud(localFavorites);
    // Optionnel : vider le localStorage après migration
    save('favoriteExercises', []);
  }
};
