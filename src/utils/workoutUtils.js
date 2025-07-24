// Utilitaires pour la gestion des workouts

// Valeur par défaut pour la durée d'une séance (en minutes)
const DEFAULT_WORKOUT_DURATION = 30;

// Ajoute une fonction utilitaire pour parser une date YYYY-MM-DD en local sans UTC
export function parseLocalDate(dateStr) {
  // dateStr: '2025-07-17' => new Date(year, monthIndex, day)
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export const createWorkout = (exercises, date, duration, workoutId = undefined, startTime = null, endTime = null) => {
  if (!exercises || exercises.length === 0) return null;
  
  // S'assurer que tous les exercices ont un type valide
  const validatedExercises = exercises.map(exercise => ({
    id: exercise.id || Date.now(),
    name: exercise.name || 'Exercice sans nom',
    type: exercise.type || 'custom', // Type par défaut si manquant
    sets: (exercise.sets || [{ reps: 0, weight: 0, duration: 0 }]).map(set => ({
      reps: parseInt(set.reps) || 0,
      weight: parseFloat(String(set.weight).replace(',', '.')) || 0,
      duration: parseInt(set.duration) || 0
    }))
  }));
  
  const workout = {
    date: date || new Date().toISOString().split('T')[0],
    exercises: validatedExercises,
    duration: parseInt(duration) || DEFAULT_WORKOUT_DURATION,
    totalSets: validatedExercises.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0),
    totalReps: validatedExercises.reduce((acc, ex) => 
      acc + (ex.sets?.reduce((setAcc, set) => setAcc + (set.reps || 0), 0) || 0), 0
    ),
    totalWeight: validatedExercises.reduce((acc, ex) => 
      acc + (ex.sets?.reduce((setAcc, set) => setAcc + ((set.weight || 0) * (set.reps || 0)), 0) || 0), 0
    )
  };
  
  // Ajouter les champs optionnels seulement s'ils ont une valeur
  if (workoutId) workout.id = workoutId;
  if (startTime) workout.startTime = startTime;
  if (endTime) workout.endTime = endTime;
  
  return workout;
};

export const calculateWorkoutStats = (workouts) => {
  const totalWorkouts = workouts.length;
  const totalSets = workouts.reduce((acc, w) => acc + w.totalSets, 0);
  const totalReps = workouts.reduce((acc, w) => acc + w.totalReps, 0);
  const totalWeight = workouts.reduce((acc, w) => acc + w.totalWeight, 0);
  const avgDuration = totalWorkouts > 0 
    ? Math.round(workouts.reduce((acc, w) => acc + w.duration, 0) / totalWorkouts) 
    : 0;
  
  return { totalWorkouts, totalSets, totalReps, totalWeight, avgDuration };
};

// Modifie formatDate pour utiliser parseLocalDate
export const formatDate = (dateStr) => {
  const d = parseLocalDate(dateStr);
  return d ? d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' }) : '';
};

export const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}; 

// Gamification: retourne les badges débloqués selon les stats
export function getBadges(stats) {
  const badges = [];
  if (stats.totalWorkouts >= 1) badges.push({ key: 'badge_first_workout', label: 'Première séance', icon: '🏅' });
  if (stats.totalWorkouts >= 5) badges.push({ key: 'badge_5_workouts', label: '5 séances', icon: '🥉' });
  if (stats.totalWorkouts >= 10) badges.push({ key: 'badge_10_workouts', label: '10 séances', icon: '🥈' });
  if (stats.totalWorkouts >= 20) badges.push({ key: 'badge_20_workouts', label: '20 séances', icon: '🥇' });
  if (stats.totalSets >= 100) badges.push({ key: 'badge_100_sets', label: '100 séries', icon: '💪' });
  if (stats.totalReps >= 1000) badges.push({ key: 'badge_1000_reps', label: '1000 reps', icon: '🔥' });
  if (stats.totalWeight >= 10000) badges.push({ key: 'badge_10k_weight', label: '10 000 kg soulevés', icon: '🏋️' });
  if (stats.avgDuration >= 60) badges.push({ key: 'badge_long_workout', label: 'Séances longues', icon: '⏱️' });
  return badges;
}

// Analyse des habitudes d'entraînement basées sur l'heure
export function analyzeWorkoutHabits(workouts) {
  const morningWorkouts = workouts.filter(w => {
    if (!w.startTime) return false;
    const hour = parseInt(w.startTime.split(':')[0]);
    return hour >= 5 && hour < 12;
  }).length;
  
  const afternoonWorkouts = workouts.filter(w => {
    if (!w.startTime) return false;
    const hour = parseInt(w.startTime.split(':')[0]);
    return hour >= 12 && hour < 18;
  }).length;
  
  const eveningWorkouts = workouts.filter(w => {
    if (!w.startTime) return false;
    const hour = parseInt(w.startTime.split(':')[0]);
    return hour >= 18 && hour < 22;
  }).length;
  
  const nightWorkouts = workouts.filter(w => {
    if (!w.startTime) return false;
    const hour = parseInt(w.startTime.split(':')[0]);
    return hour >= 22 || hour < 5;
  }).length;
  
  const totalWorkoutsWithTime = workouts.filter(w => w.startTime).length;
  
  return {
    morning: { count: morningWorkouts, percentage: totalWorkoutsWithTime > 0 ? Math.round((morningWorkouts / totalWorkoutsWithTime) * 100) : 0 },
    afternoon: { count: afternoonWorkouts, percentage: totalWorkoutsWithTime > 0 ? Math.round((afternoonWorkouts / totalWorkoutsWithTime) * 100) : 0 },
    evening: { count: eveningWorkouts, percentage: totalWorkoutsWithTime > 0 ? Math.round((eveningWorkouts / totalWorkoutsWithTime) * 100) : 0 },
    night: { count: nightWorkouts, percentage: totalWorkoutsWithTime > 0 ? Math.round((nightWorkouts / totalWorkoutsWithTime) * 100) : 0 },
    totalWithTime: totalWorkoutsWithTime
  };
}

// Détermine le moment de la journée préféré
export function getPreferredWorkoutTime(workouts) {
  const habits = analyzeWorkoutHabits(workouts);
  const times = [
    { name: 'matin', ...habits.morning, icon: '🌅' },
    { name: 'après-midi', ...habits.afternoon, icon: '☀️' },
    { name: 'soir', ...habits.evening, icon: '🌆' },
    { name: 'nuit', ...habits.night, icon: '🌙' }
  ];
  
  return times.reduce((prev, current) => 
    (current.count > prev.count) ? current : prev
  );
}

// Calcule la durée moyenne par moment de la journée
export function getAverageDurationByTime(workouts) {
  const timeSlots = {
    morning: { workouts: [], total: 0 },
    afternoon: { workouts: [], total: 0 },
    evening: { workouts: [], total: 0 },
    night: { workouts: [], total: 0 }
  };
  
  workouts.forEach(workout => {
    if (!workout.startTime || !workout.duration) return;
    
    const hour = parseInt(workout.startTime.split(':')[0]);
    if (hour >= 5 && hour < 12) {
      timeSlots.morning.workouts.push(workout);
      timeSlots.morning.total += workout.duration;
    } else if (hour >= 12 && hour < 18) {
      timeSlots.afternoon.workouts.push(workout);
      timeSlots.afternoon.total += workout.duration;
    } else if (hour >= 18 && hour < 22) {
      timeSlots.evening.workouts.push(workout);
      timeSlots.evening.total += workout.duration;
    } else {
      timeSlots.night.workouts.push(workout);
      timeSlots.night.total += workout.duration;
    }
  });
  
  return {
    morning: timeSlots.morning.workouts.length > 0 ? Math.round(timeSlots.morning.total / timeSlots.morning.workouts.length) : 0,
    afternoon: timeSlots.afternoon.workouts.length > 0 ? Math.round(timeSlots.afternoon.total / timeSlots.afternoon.workouts.length) : 0,
    evening: timeSlots.evening.workouts.length > 0 ? Math.round(timeSlots.evening.total / timeSlots.evening.workouts.length) : 0,
    night: timeSlots.night.workouts.length > 0 ? Math.round(timeSlots.night.total / timeSlots.night.workouts.length) : 0
  };
}

// Filtre les workouts par plage de dates
export function getWorkoutsForDateRange(workouts, startDate, endDate) {
  if (!workouts || !Array.isArray(workouts)) return [];
  
  return workouts.filter(workout => {
    const workoutDate = parseLocalDate(workout.date);
    return workoutDate >= startDate && workoutDate <= endDate;
  });
}

// Fonction pour nettoyer les données avant envoi à Firebase
export function cleanWorkoutForFirestore(workout) {
  if (!workout) return null;
  
  // Fonction récursive pour nettoyer les objets
  const cleanObject = (obj) => {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj.map(cleanObject).filter(item => item !== null && item !== undefined);
    }
    
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined) {
        cleaned[key] = cleanObject(value);
      }
    }
    return cleaned;
  };
  
  return cleanObject(workout);
}

export function getLastExerciseWeight(workouts, exerciseName, beforeDate = null) {
  if (!Array.isArray(workouts) || !exerciseName) return null;
  const sorted = [...workouts].sort(
    (a, b) => parseLocalDate(b.date) - parseLocalDate(a.date)
  );
  for (const workout of sorted) {
    if (beforeDate && parseLocalDate(workout.date) >= parseLocalDate(beforeDate)) continue;
    const exercise = workout.exercises?.find(
      ex => ex.name && ex.name.toLowerCase() === exerciseName.toLowerCase()
    );
    if (exercise && Array.isArray(exercise.sets)) {
      const weights = exercise.sets.map(s => parseFloat(s.weight || 0)).filter(w => w > 0);
      if (weights.length > 0) {
        return weights[weights.length - 1];
      }
    }
  }
  return null;
}

// Calcule la répartition des groupes musculaires travaillés sur toutes les séances
export function getMuscleGroupDistribution(workouts) {
  if (!Array.isArray(workouts)) return {};
  const count = {};
  workouts.forEach(w => {
    w.exercises?.forEach(ex => {
      if (ex.type) {
        count[ex.type] = (count[ex.type] || 0) + 1;
      }
    });
  });
  const total = Object.values(count).reduce((a, b) => a + b, 0);
  const distribution = {};
  Object.entries(count).forEach(([muscle, c]) => {
    distribution[muscle] = total > 0 ? Math.round((c / total) * 100) : 0;
  });
  return distribution;
}

// Retourne la progression de poids moyenne par exercice entre la première et la dernière séance
export function getWeightProgress(workouts) {
  if (!Array.isArray(workouts)) return {};
  const sorted = [...workouts].sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));
  const map = {};
  sorted.forEach(w => {
    w.exercises?.forEach(ex => {
      const weight = Array.isArray(ex.sets)
        ? ex.sets.reduce((s, set) => s + (parseFloat(set.weight) || 0), 0) / (ex.sets.length || 1)
        : 0;
      if (!map[ex.name]) {
        map[ex.name] = { first: weight, last: weight };
      } else {
        map[ex.name].last = weight;
      }
    });
  });
  const progress = {};
  Object.entries(map).forEach(([name, { first, last }]) => {
    progress[name] = Math.round(last - first);
  });
  return progress;
}

// Calcule le poids moyen par exercice sur l'ensemble des séances
export function getAverageWeights(workouts) {
  if (!Array.isArray(workouts)) return {};
  const totals = {};
  const counts = {};
  workouts.forEach(w => {
    w.exercises?.forEach(ex => {
      if (Array.isArray(ex.sets)) {
        ex.sets.forEach(set => {
          const weight = parseFloat(set.weight) || 0;
          totals[ex.name] = (totals[ex.name] || 0) + weight;
          counts[ex.name] = (counts[ex.name] || 0) + 1;
        });
      }
    });
  });
  const averages = {};
  Object.keys(totals).forEach(name => {
    averages[name] = Math.round(totals[name] / counts[name]);
  });
  return averages;
}
