import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

// XP nécessaire pour chaque niveau (progression exponentielle)
function xpRequired(level) {
  return Math.floor(100 * Math.pow(1.2, level - 1));
}

// Noms de niveaux (exemple)
const LEVEL_NAMES = [
  'Débutant', 'Novice', 'Apprenti', 'Élève', 'Initié', 'Adepte', 'Pratiquant', 'Exercé', 'Habitué', 'Régulier',
  'Sportif', 'Athlète', 'Compétiteur', 'Entraîné', 'Aguerri', 'Expérimenté', 'Vétéran', 'Expert', 'Maître', 'Champion',
  'Légende', 'Héros', 'Titan', 'Géant', 'Monstre', 'Phénomène', 'Prodige', 'Génie', 'Virtuose', 'Dieu du Sport'
];

function getLevelName(level) {
  if (level <= LEVEL_NAMES.length) return LEVEL_NAMES[level - 1];
  return 'Légende';
}

function calculateLevel(xp) {
  let level = 1;
  while (xp >= xpRequired(level + 1)) {
    level++;
  }
  return level;
}

function calculateProgress(xp, level) {
  const xpForCurrent = xpRequired(level);
  const xpForNext = xpRequired(level + 1);
  return Math.max(0, Math.min(100, ((xp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100));
}

// XP pour différentes actions
const XP_REWARDS = {
  WORKOUT: {
    BASE: 10,
    DURATION_BONUS: 5, // par 30 minutes
    EXERCISE_BONUS: 2, // par exercice unique
    STREAK_BONUS: 10   // si séance la veille
  },
  BADGE_UNLOCK: 25,    // Déblocage d'un badge
  FRIEND_ADD: 15,      // Ajout d'un ami
  CHALLENGE_SEND: 20,  // Envoi d'un défi
  CHALLENGE_WIN: 50,   // Victoire d'un défi
  STREAK_MILESTONE: 30, // Atteinte d'un palier de streak
  DAILY_LOGIN: 5,      // Connexion quotidienne
  WEEKLY_GOAL: 40,     // Objectif hebdomadaire atteint
  MONTHLY_GOAL: 100,   // Objectif mensuel atteint
  PERSONAL_RECORD: 35, // Nouveau record personnel
  PERFECT_WORKOUT: 25  // Séance parfaite (tous les exercices complétés)
};

function calculateWorkoutXP(workout, previousWorkouts = []) {
  let xp = XP_REWARDS.WORKOUT.BASE;
  const duration = workout.duration || 0;
  xp += Math.floor(duration / 30) * XP_REWARDS.WORKOUT.DURATION_BONUS;
  const uniqueExercises = new Set((workout.exercises || []).map(ex => ex.name)).size;
  xp += uniqueExercises * XP_REWARDS.WORKOUT.EXERCISE_BONUS;
  
  // Bonus streak si séance la veille
  if (previousWorkouts.length > 0) {
    const lastWorkoutDate = new Date(previousWorkouts[0].date);
    const currentWorkoutDate = new Date(workout.date);
    const daysDiff = Math.floor((currentWorkoutDate - lastWorkoutDate) / (1000 * 60 * 60 * 24));
    if (daysDiff === 1) xp += XP_REWARDS.WORKOUT.STREAK_BONUS;
  }
  
  // Bonus séance parfaite (tous les exercices ont des sets complétés)
  const allExercisesCompleted = workout.exercises?.every(ex => 
    ex.sets?.some(set => set.reps > 0 || set.weight > 0 || set.duration > 0)
  );
  if (allExercisesCompleted) {
    xp += XP_REWARDS.PERFECT_WORKOUT;
  }
  
  return xp;
}

export const useExperience = (user) => {
  const [experience, setExperience] = useState({
    xp: 0,
    level: 1,
    progress: 0,
    levelName: 'Débutant',
    totalWorkouts: 0,
    streak: 0
  });
  const [loading, setLoading] = useState(false);
  const experienceRef = useRef(experience);

  // Mettre à jour la ref quand l'expérience change
  useEffect(() => {
    experienceRef.current = experience;
  }, [experience]);

  // Charger l'expérience depuis Firestore
  const loadExperience = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        const xp = data.experience?.xp || 0;
        const level = calculateLevel(xp);
        const progress = calculateProgress(xp, level);
        const levelName = getLevelName(level);
        setExperience({
          xp,
          level,
          progress,
          levelName,
          totalWorkouts: data.experience?.totalWorkouts || 0,
          streak: data.experience?.streak || 0
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'expérience:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Ajouter de l'XP pour une séance
  const addWorkoutXP = useCallback(async (workout, previousWorkouts = []) => {
    if (!user?.uid) return;
    const xpGained = calculateWorkoutXP(workout, previousWorkouts);
    const currentExp = experienceRef.current;
    const newXP = currentExp.xp + xpGained;
    const newLevel = calculateLevel(newXP);
    const newProgress = calculateProgress(newXP, newLevel);
    const newLevelName = getLevelName(newLevel);
    const levelUp = newLevel > currentExp.level;

    // Calcul streak
    let newStreak = 1;
    let streakIncreased = false;
    if (previousWorkouts.length > 0) {
      const lastWorkoutDate = new Date(previousWorkouts[0].date);
      const currentWorkoutDate = new Date(workout.date);
      const daysDiff = Math.floor((currentWorkoutDate - lastWorkoutDate) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        newStreak = currentExp.streak + 1;
        streakIncreased = true;
      } else if (daysDiff === 0) {
        newStreak = currentExp.streak; // même jour, ne pas incrémenter
      } else {
        newStreak = 1; // streak reset
      }
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'experience.xp': newXP,
        'experience.level': newLevel,
        'experience.levelName': newLevelName,
        'experience.totalWorkouts': currentExp.totalWorkouts + 1,
        'experience.lastWorkoutDate': new Date().toISOString(),
        'experience.streak': newStreak
      });
      setExperience(prev => ({
        ...prev,
        xp: newXP,
        level: newLevel,
        progress: newProgress,
        levelName: newLevelName,
        totalWorkouts: prev.totalWorkouts + 1,
        streak: newStreak
      }));
      return {
        xpGained,
        levelUp,
        newLevel,
        newLevelName,
        streakIncreased,
        newStreak
      };
    } catch (error) {
      console.error("Erreur lors de l'ajout d'XP:", error);
      throw error;
    }
  }, [user]);

  // Fonction générique pour ajouter de l'XP
  const addXP = useCallback(async (amount, reason = '') => {
    if (!user?.uid || amount <= 0) return { xpGained: 0, levelUp: false };
    
    const currentExp = experienceRef.current;
    const newXP = currentExp.xp + amount;
    const newLevel = calculateLevel(newXP);
    const newProgress = calculateProgress(newXP, newLevel);
    const newLevelName = getLevelName(newLevel);
    const levelUp = newLevel > currentExp.level;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'experience.xp': newXP,
        'experience.level': newLevel,
        'experience.levelName': newLevelName
      });
      
      setExperience(prev => ({
        ...prev,
        xp: newXP,
        level: newLevel,
        progress: newProgress,
        levelName: newLevelName
      }));
      
      return {
        xpGained: amount,
        levelUp,
        newLevel,
        newLevelName,
        reason
      };
    } catch (error) {
      console.error("Erreur lors de l'ajout d'XP:", error);
      throw error;
    }
  }, [user]);

  // Ajouter de l'XP pour déblocage de badge
  const addBadgeUnlockXP = useCallback(async (badgeName) => {
    return await addXP(XP_REWARDS.BADGE_UNLOCK, `Badge débloqué: ${badgeName}`);
  }, [addXP]);

  // Ajouter de l'XP pour ajout d'ami
  const addFriendXP = useCallback(async (friendName) => {
    return await addXP(XP_REWARDS.FRIEND_ADD, `Nouvel ami: ${friendName}`);
  }, [addXP]);

  // Ajouter de l'XP pour envoi de défi
  const addChallengeSendXP = useCallback(async (challengeName) => {
    return await addXP(XP_REWARDS.CHALLENGE_SEND, `Défi envoyé: ${challengeName}`);
  }, [addXP]);

  // Ajouter de l'XP pour victoire de défi
  const addChallengeWinXP = useCallback(async (challengeName) => {
    return await addXP(XP_REWARDS.CHALLENGE_WIN, `Défi gagné: ${challengeName}`);
  }, [addXP]);

  // Ajouter de l'XP pour palier de streak
  const addStreakMilestoneXP = useCallback(async (streakCount) => {
    return await addXP(XP_REWARDS.STREAK_MILESTONE, `Streak de ${streakCount} jours !`);
  }, [addXP]);

  // Ajouter de l'XP pour connexion quotidienne
  const addDailyLoginXP = useCallback(async () => {
    return await addXP(XP_REWARDS.DAILY_LOGIN, 'Connexion quotidienne');
  }, [addXP]);

  // Ajouter de l'XP pour objectif hebdomadaire
  const addWeeklyGoalXP = useCallback(async (goalName) => {
    return await addXP(XP_REWARDS.WEEKLY_GOAL, `Objectif hebdomadaire: ${goalName}`);
  }, [addXP]);

  // Ajouter de l'XP pour objectif mensuel
  const addMonthlyGoalXP = useCallback(async (goalName) => {
    return await addXP(XP_REWARDS.MONTHLY_GOAL, `Objectif mensuel: ${goalName}`);
  }, [addXP]);

  // Ajouter de l'XP pour record personnel
  const addPersonalRecordXP = useCallback(async (exerciseName) => {
    return await addXP(XP_REWARDS.PERSONAL_RECORD, `Record personnel: ${exerciseName}`);
  }, [addXP]);

  // Mettre à jour le streak
  const updateStreak = useCallback(async (streak) => {
    if (!user?.uid) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'experience.streak': streak
      });
      setExperience(prev => ({
        ...prev,
        streak
      }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du streak:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      loadExperience();
    }
  }, [user, loadExperience]);

  return {
    experience,
    loading,
    addWorkoutXP,
    updateStreak,
    loadExperience,
    calculateWorkoutXP,
    getLevelName,
    addXP,
    addBadgeUnlockXP,
    addFriendXP,
    addChallengeSendXP,
    addChallengeWinXP,
    addStreakMilestoneXP,
    addDailyLoginXP,
    addWeeklyGoalXP,
    addMonthlyGoalXP,
    addPersonalRecordXP,
    XP_REWARDS
  };
}; 