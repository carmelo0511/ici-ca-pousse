import { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

// Types de défis quotidiens
const DAILY_CHALLENGE_TYPES = {
  // Défis de base
  daily_workout: {
    name: 'Séance quotidienne',
    description: 'Faire une séance d\'entraînement aujourd\'hui',
    icon: '💪',
    category: 'base'
  },
  daily_streak: {
    name: 'Maintenir le streak',
    description: 'Continuer votre série d\'entraînements',
    icon: '🔥',
    category: 'motivation'
  },
  daily_duration: {
    name: 'Séance complète',
    description: 'Faire une séance de plus de 30 minutes',
    icon: '⏱️',
    category: 'performance'
  },
  
  // Défis de variété
  daily_new_exercise: {
    name: 'Nouvel exercice',
    description: 'Essayer un nouvel exercice aujourd\'hui',
    icon: '🆕',
    category: 'variété'
  },
  daily_muscle_group: {
    name: 'Groupe musculaire',
    description: 'Travailler un groupe musculaire spécifique',
    icon: '🎯',
    category: 'ciblage'
  },
  
  // Défis de timing
  daily_morning: {
    name: 'Séance matinale',
    description: 'Faire votre séance avant 10h',
    icon: '🌅',
    category: 'timing'
  },
  daily_consistency: {
    name: 'Régularité',
    description: 'Faire votre séance à la même heure qu\'hier',
    icon: '🕐',
    category: 'habitude'
  }
};

// Objectifs par type et niveau
const DAILY_CHALLENGE_TARGETS = {
  daily_workout: { value: 1, xp: 25 },
  daily_streak: { value: 1, xp: 30 },
  daily_duration: { value: 30, xp: 35 },
  daily_new_exercise: { value: 1, xp: 40 },
  daily_muscle_group: { value: 1, xp: 30 },
  daily_morning: { value: 1, xp: 45 },
  daily_consistency: { value: 1, xp: 35 }
};

export const useDailyChallenges = (user, workouts, addXP) => {
  const [dailyChallenges, setDailyChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [todayChallenges, setTodayChallenges] = useState([]);

  // Charger les défis quotidiens depuis Firestore
  const loadDailyChallenges = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      const dailyChallengesRef = doc(userRef, 'dailyChallenges', 'current');
      
      const docSnap = await getDoc(dailyChallengesRef);
      if (docSnap.exists()) {
        setDailyChallenges(docSnap.data().challenges || []);
      } else {
        // Créer des défis quotidiens par défaut
        await generateDailyChallenges();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des défis quotidiens:', error);
    } finally {
      setLoading(false);
    }
  }, [user, generateDailyChallenges]);

  // Générer de nouveaux défis quotidiens
  const generateDailyChallenges = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      // Analyser l'historique de l'utilisateur
      const userStats = analyzeUserHistory(workouts);
      
      // Sélectionner 3 défis quotidiens personnalisés
      const selectedChallenges = selectPersonalizedChallenges(userStats);
      
      const newDailyChallenges = selectedChallenges.map(challenge => ({
        id: `${challenge.type}_${Date.now()}`,
        type: challenge.type,
        name: challenge.name,
        description: challenge.description,
        icon: challenge.icon,
        category: challenge.category,
        target: challenge.target,
        xp: challenge.xp,
        createdAt: new Date().toISOString(),
        completed: false,
        progress: 0,
        completedAt: null
      }));

      // Sauvegarder dans Firestore
      const userRef = doc(db, 'users', user.uid);
      const dailyChallengesRef = doc(userRef, 'dailyChallenges', 'current');
      
      await setDoc(dailyChallengesRef, {
        challenges: newDailyChallenges,
        generatedAt: new Date().toISOString(),
        userId: user.uid
      });

      setDailyChallenges(newDailyChallenges);
    } catch (error) {
      console.error('Erreur lors de la génération des défis quotidiens:', error);
    }
  }, [user, workouts, analyzeUserHistory, selectPersonalizedChallenges]);

  // Analyser l'historique de l'utilisateur
  const analyzeUserHistory = useCallback((workouts) => {
    if (!workouts || workouts.length === 0) {
      return {
        totalWorkouts: 0,
        averageDuration: 0,
        favoriteMuscleGroups: [],
        workoutTimes: [],
        streak: 0,
        level: 'beginner'
      };
    }

    // Calculer les statistiques
    const totalWorkouts = workouts.length;
    const averageDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0) / totalWorkouts;
    
    // Groupes musculaires favoris
    const muscleGroups = {};
    workouts.forEach(workout => {
      workout.exercises?.forEach(exercise => {
        if (exercise.type && exercise.type !== 'custom') {
          muscleGroups[exercise.type] = (muscleGroups[exercise.type] || 0) + 1;
        }
      });
    });
    const favoriteMuscleGroups = Object.entries(muscleGroups)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([group]) => group);

    // Heures d'entraînement
    const workoutTimes = workouts.map(w => new Date(w.date).getHours());

    // Calculer le streak actuel
    const sortedWorkouts = workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < sortedWorkouts.length; i++) {
      const workoutDate = new Date(sortedWorkouts[i].date);
      const daysDiff = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }

    // Déterminer le niveau
    let level = 'beginner';
    if (totalWorkouts > 50) level = 'expert';
    else if (totalWorkouts > 20) level = 'intermediate';
    else if (totalWorkouts > 5) level = 'beginner';

    return {
      totalWorkouts,
      averageDuration,
      favoriteMuscleGroups,
      workoutTimes,
      streak,
      level
    };
  }, []);

  // Sélectionner des défis personnalisés
  const selectPersonalizedChallenges = useCallback((userStats) => {
    const challenges = [];
    
    // Défi de base : toujours inclure
    challenges.push({
      ...DAILY_CHALLENGE_TYPES.daily_workout,
      type: 'daily_workout',
      target: DAILY_CHALLENGE_TARGETS.daily_workout.value,
      xp: DAILY_CHALLENGE_TARGETS.daily_workout.xp
    });

    // Défi de streak si l'utilisateur a un streak
    if (userStats.streak > 0) {
      challenges.push({
        ...DAILY_CHALLENGE_TYPES.daily_streak,
        type: 'daily_streak',
        target: DAILY_CHALLENGE_TARGETS.daily_streak.value,
        xp: DAILY_CHALLENGE_TARGETS.daily_streak.xp
      });
    }

    // Défi de durée si l'utilisateur fait des séances longues
    if (userStats.averageDuration > 25) {
      challenges.push({
        ...DAILY_CHALLENGE_TYPES.daily_duration,
        type: 'daily_duration',
        target: DAILY_CHALLENGE_TARGETS.daily_duration.value,
        xp: DAILY_CHALLENGE_TARGETS.daily_duration.xp
      });
    }

    // Défi de groupe musculaire si l'utilisateur a des préférences
    if (userStats.favoriteMuscleGroups.length > 0) {
      const randomGroup = userStats.favoriteMuscleGroups[Math.floor(Math.random() * userStats.favoriteMuscleGroups.length)];
      challenges.push({
        ...DAILY_CHALLENGE_TYPES.daily_muscle_group,
        type: 'daily_muscle_group',
        target: randomGroup,
        xp: DAILY_CHALLENGE_TARGETS.daily_muscle_group.xp,
        description: `Travailler le groupe musculaire : ${randomGroup}`
      });
    }

    // Défi matinal si l'utilisateur fait des séances tôt
    const morningWorkouts = userStats.workoutTimes.filter(time => time < 10).length;
    if (morningWorkouts > userStats.totalWorkouts * 0.3) {
      challenges.push({
        ...DAILY_CHALLENGE_TYPES.daily_morning,
        type: 'daily_morning',
        target: DAILY_CHALLENGE_TARGETS.daily_morning.value,
        xp: DAILY_CHALLENGE_TARGETS.daily_morning.xp
      });
    }

    // Défi de nouveauté pour les utilisateurs expérimentés
    if (userStats.level === 'expert') {
      challenges.push({
        ...DAILY_CHALLENGE_TYPES.daily_new_exercise,
        type: 'daily_new_exercise',
        target: DAILY_CHALLENGE_TARGETS.daily_new_exercise.value,
        xp: DAILY_CHALLENGE_TARGETS.daily_new_exercise.xp
      });
    }

    // Retourner 3 défis maximum
    return challenges.slice(0, 3);
  }, []);

  // Vérifier la progression des défis
  const checkDailyProgress = useCallback(() => {
    if (!workouts || workouts.length === 0 || !dailyChallenges.length) return;

    const today = new Date().toISOString().slice(0, 10); // Format YYYY-MM-DD
    const todayWorkouts = workouts.filter(workout => 
      workout.date === today
    );

    const updatedChallenges = dailyChallenges.map(challenge => {
      let progress = 0;
      let completed = false;

      switch (challenge.type) {
        case 'daily_workout':
          progress = todayWorkouts.length;
          completed = progress >= challenge.target;
          break;

        case 'daily_duration':
          progress = todayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
          completed = progress >= challenge.target;
          break;

        case 'daily_new_exercise':
          const newExercises = new Set();
          todayWorkouts.forEach(workout => {
            workout.exercises?.forEach(exercise => {
              newExercises.add(exercise.name);
            });
          });
          progress = newExercises.size;
          completed = progress >= challenge.target;
          break;

        case 'daily_muscle_group':
          const targetGroup = challenge.target;
          const hasTargetGroup = todayWorkouts.some(workout =>
            workout.exercises?.some(exercise => exercise.type === targetGroup)
          );
          progress = hasTargetGroup ? 1 : 0;
          completed = progress >= challenge.target;
          break;

        case 'daily_morning':
          const morningWorkouts = todayWorkouts.filter(workout => {
            if (!workout.startTime) return false;
            const [hours] = workout.startTime.split(':');
            return parseInt(hours) < 10;
          });
          progress = morningWorkouts.length;
          completed = progress >= challenge.target;
          break;

        default:
          progress = 0;
          completed = false;
      }

      return {
        ...challenge,
        progress,
        completed,
        completedAt: completed && !challenge.completedAt ? new Date().toISOString() : challenge.completedAt
      };
    });

    setDailyChallenges(updatedChallenges);
  }, [workouts, dailyChallenges]);

  // Marquer un défi comme terminé
  const completeDailyChallenge = useCallback(async (challengeId) => {
    if (!user?.uid) return;

    try {
      const challenge = dailyChallenges.find(c => c.id === challengeId);
      if (!challenge || challenge.completed) return;

      // Ajouter l'XP
      if (addXP) {
        await addXP(challenge.xp, `Défi quotidien : ${challenge.name}`);
      }

      // Mettre à jour le défi
      const updatedChallenges = dailyChallenges.map(c =>
        c.id === challengeId
          ? { ...c, completed: true, completedAt: new Date().toISOString() }
          : c
      );

      // Sauvegarder dans Firestore
      const userRef = doc(db, 'users', user.uid);
      const dailyChallengesRef = doc(userRef, 'dailyChallenges', 'current');
      
      await updateDoc(dailyChallengesRef, {
        challenges: updatedChallenges
      });

      setDailyChallenges(updatedChallenges);
    } catch (error) {
      console.error('Erreur lors de la complétion du défi quotidien:', error);
    }
  }, [dailyChallenges, user, addXP]);

  // Vérifier si de nouveaux défis doivent être générés
  const checkForNewDailyChallenges = useCallback(() => {
    if (dailyChallenges.length === 0) return;

    const lastGenerated = dailyChallenges[0]?.createdAt;
    if (!lastGenerated) return;

    const lastGeneratedDate = new Date(lastGenerated).toDateString();
    const today = new Date().toDateString();

    if (lastGeneratedDate !== today) {
      generateDailyChallenges();
    }
  }, [dailyChallenges, generateDailyChallenges]);

  // Effets
  useEffect(() => {
    loadDailyChallenges();
  }, [loadDailyChallenges]);

  useEffect(() => {
    checkDailyProgress();
  }, [checkDailyProgress]);

  useEffect(() => {
    checkForNewDailyChallenges();
  }, [checkForNewDailyChallenges]);

  // Filtrer les défis d'aujourd'hui
  useEffect(() => {
    const today = new Date().toDateString();
    const todayChallenges = dailyChallenges.filter(challenge => {
      const challengeDate = new Date(challenge.createdAt).toDateString();
      return challengeDate === today;
    });
    setTodayChallenges(todayChallenges);
  }, [dailyChallenges]);

  return {
    dailyChallenges,
    todayChallenges,
    loading,
    generateDailyChallenges,
    completeDailyChallenge,
    checkDailyProgress
  };
}; 