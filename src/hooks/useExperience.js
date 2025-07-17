import { useState, useEffect, useCallback } from 'react';
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

function calculateWorkoutXP(workout, previousWorkouts = []) {
  let xp = 10; // Base XP
  const duration = workout.duration || 0;
  xp += Math.floor(duration / 30) * 5;
  const uniqueExercises = new Set((workout.exercises || []).map(ex => ex.name)).size;
  xp += uniqueExercises * 2;
  // Bonus streak si séance la veille
  if (previousWorkouts.length > 0) {
    const lastWorkoutDate = new Date(previousWorkouts[0].date);
    const currentWorkoutDate = new Date(workout.date);
    const daysDiff = Math.floor((currentWorkoutDate - lastWorkoutDate) / (1000 * 60 * 60 * 24));
    if (daysDiff === 1) xp += 10;
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
    const newXP = experience.xp + xpGained;
    const newLevel = calculateLevel(newXP);
    const newProgress = calculateProgress(newXP, newLevel);
    const newLevelName = getLevelName(newLevel);
    const levelUp = newLevel > experience.level;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'experience.xp': newXP,
        'experience.level': newLevel,
        'experience.levelName': newLevelName,
        'experience.totalWorkouts': experience.totalWorkouts + 1,
        'experience.lastWorkoutDate': new Date().toISOString()
      });
      setExperience(prev => ({
        ...prev,
        xp: newXP,
        level: newLevel,
        progress: newProgress,
        levelName: newLevelName,
        totalWorkouts: prev.totalWorkouts + 1
      }));
      return {
        xpGained,
        levelUp,
        newLevel,
        newLevelName
      };
    } catch (error) {
      console.error("Erreur lors de l'ajout d'XP:", error);
      throw error;
    }
  }, [user, experience]);

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
    getLevelName
  };
}; 