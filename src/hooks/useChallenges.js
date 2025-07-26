import { useState, useEffect, useCallback } from 'react';
import {
  createChallengeInFirebase,
  getChallengesFromFirebase,
  updateChallengeInFirebase,
  deleteChallengeFromFirebase
} from '../utils/firebase';
import { getWorkoutsForDateRange, parseLocalDate } from '../utils/workoutUtils';
import { useWorkouts } from './useWorkouts';

export const useChallenges = (user, addChallengeSendXP, addChallengeWinXP) => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const { workouts } = useWorkouts(user);

  // Types de défis disponibles
  const challengeTypes = [
    // Défis de base
    { id: 'workouts', label: 'Nombre de séances', icon: '💪', category: 'base' },
    { id: 'duration', label: "Temps d'entraînement", icon: '⏱️', category: 'base' },
    { id: 'streak', label: 'Série consécutive', icon: '🔥', category: 'base' },
    
    // Défis de progression
    { id: 'progression', label: 'Progression poids', icon: '📈', category: 'progression' },
    { id: 'personal_records', label: 'Records personnels', icon: '🏅', category: 'progression' },
    { id: 'new_exercises', label: 'Nouveaux exercices', icon: '🆕', category: 'progression' },
    
    // Défis de régularité
    { id: 'weekly_consistency', label: 'Régularité hebdo', icon: '📅', category: 'regularity' },
    { id: 'morning_workouts', label: 'Séances matinales', icon: '🌅', category: 'regularity' },
    { id: 'weekend_workouts', label: 'Séances weekend', icon: '🎯', category: 'regularity' },
    
    // Défis de variété
    { id: 'muscle_groups', label: 'Groupes musculaires', icon: '🎭', category: 'variety' },
    { id: 'cardio_sessions', label: 'Séances cardio', icon: '❤️', category: 'variety' },
    { id: 'strength_sessions', label: 'Séances force', icon: '💪', category: 'variety' },
    
    // Défis de performance
    { id: 'long_workouts', label: 'Séances longues', icon: '⏰', category: 'performance' },
    { id: 'intensity', label: 'Haute intensité', icon: '⚡', category: 'performance' },
    { id: 'volume', label: 'Volume d\'entraînement', icon: '📊', category: 'performance' }
  ];

  // Durées disponibles
  const challengeDurations = [
    { value: 1, label: '1 jour', category: 'quick' },
    { value: 3, label: '3 jours', category: 'short' },
    { value: 7, label: '1 semaine', category: 'standard' },
    { value: 14, label: '2 semaines', category: 'medium' },
    { value: 21, label: '3 semaines', category: 'long' },
    { value: 30, label: '1 mois', category: 'long' },
    { value: 60, label: '2 mois', category: 'extended' },
    { value: 90, label: '3 mois', category: 'extended' }
  ];

  // Objectifs par type de défi
  const challengeTargets = {
    workouts: [3, 5, 7, 10, 15, 20],
    duration: [30, 60, 90, 120, 180, 240], // minutes
    streak: [3, 5, 7, 10, 14, 21], // jours consécutifs

    progression: [5, 10, 15, 20, 25, 30], // % d'amélioration
    personal_records: [1, 3, 5, 7, 10, 15], // nombre de records
    new_exercises: [2, 5, 8, 12, 15, 20], // nouveaux exercices
    weekly_consistency: [3, 4, 5, 6, 7], // jours par semaine
    morning_workouts: [2, 3, 4, 5, 6, 7], // séances matinales
    weekend_workouts: [1, 2, 3, 4], // séances weekend
    muscle_groups: [3, 4, 5, 6, 7, 8], // groupes musculaires
    cardio_sessions: [2, 3, 4, 5, 6, 7], // séances cardio
    strength_sessions: [2, 3, 4, 5, 6, 7], // séances force
    long_workouts: [45, 60, 75, 90, 105, 120], // minutes
    intensity: [70, 75, 80, 85, 90, 95], // % d'intensité
    volume: [1000, 2000, 3000, 5000, 7500, 10000] // volume total
  };

  const loadChallenges = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const challengesData = await getChallengesFromFirebase(user.uid);
      setChallenges(challengesData);
    } catch (error) {
      console.error('Erreur lors du chargement des défis:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      loadChallenges();
    }
  }, [user, loadChallenges]);

  const createChallenge = useCallback(async (challengeData) => {
    if (!user?.uid) return null;
    const newChallenge = {
      senderId: user.uid,
      senderName: user.displayName || user.email,
      receiverId: challengeData.friend.uid,
      receiverName: challengeData.friend.displayName || challengeData.friend.email,
      type: challengeData.type,
      duration: challengeData.duration,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + challengeData.duration * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      myScore: 0,
      friendScore: 0,
      winner: null
    };
    try {
      const createdChallenge = await createChallengeInFirebase(newChallenge);
      setChallenges(prev => [...prev, createdChallenge]);
      
      // Ajouter de l'XP pour l'envoi du défi
      if (addChallengeSendXP) {
        try {
          const challengeName = `${challengeData.type} vs ${challengeData.friend.displayName}`;
          await addChallengeSendXP(challengeName);
          // Défi envoyé avec succès
        } catch (error) {
          console.error('Erreur lors de l\'ajout d\'XP pour défi:', error);
        }
      }
      
      return createdChallenge;
    } catch (error) {
      console.error('Erreur lors de la création du défi:', error);
      throw error;
    }
  }, [user, addChallengeSendXP]);

  const updateChallenge = useCallback(async (challengeId, updates) => {
    try {
      await updateChallengeInFirebase(challengeId, updates);
      setChallenges(prev => prev.map(challenge =>
        challenge.id === challengeId ? { ...challenge, ...updates } : challenge
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du défi:', error);
      throw error;
    }
  }, []);

  const deleteChallenge = useCallback(async (challengeId) => {
    try {
      await deleteChallengeFromFirebase(challengeId);
      setChallenges(prev => prev.filter(challenge => challenge.id !== challengeId));
    } catch (error) {
      console.error('Erreur lors de la suppression du défi:', error);
      throw error;
    }
  }, []);

  const getChallengeScore = useCallback((challenge) => {
    try {
      // S'assurer que les dates sont bien des objets Date
      const start = typeof challenge.startDate === 'string' ? new Date(challenge.startDate) : challenge.startDate;
      const end = typeof challenge.endDate === 'string' ? new Date(challenge.endDate) : challenge.endDate;
      const filteredWorkouts = getWorkoutsForDateRange(workouts, start, end);
      
      switch (challenge.type) {
        // Défis de base
        case 'workouts':
          return filteredWorkouts.length;
        case 'duration':
          return filteredWorkouts.reduce((total, workout) => total + (workout.duration || 0), 0);
        case 'streak': {
          const sortedDates = filteredWorkouts
            .map(w => parseLocalDate(w.date))
            .sort((a, b) => a - b);
          let maxStreak = 0;
          let currentStreak = 0;
          let lastDate = null;
          sortedDates.forEach(date => {
            if (!lastDate || (date - lastDate) / (1000 * 60 * 60 * 24) === 1) {
              currentStreak++;
              maxStreak = Math.max(maxStreak, currentStreak);
            } else {
              currentStreak = 1;
            }
            lastDate = date;
          });
          return maxStreak;
        }

        
        // Défis de progression
        case 'progression': {
          // Calculer la progression moyenne des poids sur les exercices
          const exerciseProgressions = {};
          filteredWorkouts.forEach(workout => {
            workout.exercises?.forEach(exercise => {
              if (!exerciseProgressions[exercise.name]) {
                exerciseProgressions[exercise.name] = [];
              }
              exercise.sets?.forEach(set => {
                if (set.weight) {
                  exerciseProgressions[exercise.name].push(set.weight);
                }
              });
            });
          });
          
          let totalProgression = 0;
          let exerciseCount = 0;
          Object.values(exerciseProgressions).forEach(weights => {
            if (weights.length > 1) {
              const firstWeight = weights[0];
              const lastWeight = weights[weights.length - 1];
              const progression = ((lastWeight - firstWeight) / firstWeight) * 100;
              totalProgression += progression;
              exerciseCount++;
            }
          });
          
          return exerciseCount > 0 ? Math.round(totalProgression / exerciseCount) : 0;
        }
        
        case 'personal_records': {
          // Compter les records personnels battus
          const records = new Set();
          filteredWorkouts.forEach(workout => {
            workout.exercises?.forEach(exercise => {
              exercise.sets?.forEach(set => {
                if (set.weight && set.reps) {
                  const record = `${exercise.name}-${set.weight}kg-${set.reps}reps`;
                  records.add(record);
                }
              });
            });
          });
          return records.size;
        }
        
        case 'new_exercises': {
          // Compter les nouveaux exercices essayés
          const newExercises = new Set();
          filteredWorkouts.forEach(workout => {
            workout.exercises?.forEach(exercise => {
              newExercises.add(exercise.name);
            });
          });
          return newExercises.size;
        }
        
        // Défis de régularité
        case 'weekly_consistency': {
          // Calculer la régularité hebdomadaire moyenne
          const weeks = {};
          filteredWorkouts.forEach(workout => {
            const weekStart = new Date(workout.date);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const weekKey = weekStart.toISOString().split('T')[0];
            weeks[weekKey] = (weeks[weekKey] || 0) + 1;
          });
          
          const weeklyAverages = Object.values(weeks);
          return weeklyAverages.length > 0 
            ? Math.round(weeklyAverages.reduce((a, b) => a + b, 0) / weeklyAverages.length)
            : 0;
        }
        
        case 'morning_workouts': {
          // Compter les séances matinales (avant 10h)
          return filteredWorkouts.filter(workout => {
            const workoutTime = new Date(workout.date);
            return workoutTime.getHours() < 10;
          }).length;
        }
        
        case 'weekend_workouts': {
          // Compter les séances le weekend
          return filteredWorkouts.filter(workout => {
            const workoutDay = new Date(workout.date).getDay();
            return workoutDay === 0 || workoutDay === 6; // Dimanche ou Samedi
          }).length;
        }
        
        // Défis de variété
        case 'muscle_groups': {
          // Compter les groupes musculaires différents travaillés
          const muscleGroups = new Set();
          filteredWorkouts.forEach(workout => {
            workout.exercises?.forEach(exercise => {
              if (exercise.type && exercise.type !== 'custom') {
                muscleGroups.add(exercise.type);
              }
            });
          });
          return muscleGroups.size;
        }
        
        case 'cardio_sessions': {
          // Compter les séances cardio
          return filteredWorkouts.filter(workout => 
            workout.exercises?.some(exercise => exercise.type === 'cardio')
          ).length;
        }
        
        case 'strength_sessions': {
          // Compter les séances de force (non-cardio)
          return filteredWorkouts.filter(workout => 
            workout.exercises?.some(exercise => exercise.type !== 'cardio' && exercise.type !== 'custom')
          ).length;
        }
        
        // Défis de performance
        case 'long_workouts': {
          // Compter les séances longues (>45 min)
          return filteredWorkouts.filter(workout => 
            (workout.duration || 0) > 45
          ).length;
        }
        
        case 'intensity': {
          // Calculer l'intensité moyenne des séances
          const intensities = filteredWorkouts.map(workout => {
            if (!workout.exercises?.length) return 0;
            
            let totalIntensity = 0;
            let exerciseCount = 0;
            
            workout.exercises.forEach(exercise => {
              exercise.sets?.forEach(set => {
                if (set.weight && set.reps) {
                  // Calcul simple d'intensité basé sur le poids et les reps
                  const intensity = (set.weight * set.reps) / 100; // Normalisé
                  totalIntensity += intensity;
                  exerciseCount++;
                }
              });
            });
            
            return exerciseCount > 0 ? (totalIntensity / exerciseCount) * 100 : 0;
          });
          
          return intensities.length > 0 
            ? Math.round(intensities.reduce((a, b) => a + b, 0) / intensities.length)
            : 0;
        }
        
        case 'volume': {
          // Calculer le volume total d'entraînement
          let totalVolume = 0;
          filteredWorkouts.forEach(workout => {
            workout.exercises?.forEach(exercise => {
              exercise.sets?.forEach(set => {
                if (set.weight && set.reps) {
                  totalVolume += set.weight * set.reps;
                }
              });
            });
          });
          return Math.round(totalVolume);
        }
        
        default:
          return 0;
      }
    } catch (error) {
      console.error('Erreur lors du calcul du score:', error);
      return 0;
    }
  }, [workouts]);

  const getActiveChallenges = useCallback(() => {
    return challenges.filter(challenge =>
      (challenge.status === 'active' || challenge.status === 'pending' || challenge.status === 'accepted') &&
      new Date() <= new Date(challenge.endDate)
    );
  }, [challenges]);

  const getCompletedChallenges = useCallback(() => {
    return challenges.filter(challenge =>
      challenge.status === 'completed' || new Date() > new Date(challenge.endDate)
    );
  }, [challenges]);

  const formatScore = useCallback((score, type) => {
    switch (type) {
      // Défis de base
      case 'workouts':
        return `${score} séances`;
      case 'duration':
        return `${score} min`;
      case 'streak':
        return `${score} jours`;

      
      // Défis de progression
      case 'progression':
        return `${score}%`;
      case 'personal_records':
        return `${score} records`;
      case 'new_exercises':
        return `${score} exercices`;
      
      // Défis de régularité
      case 'weekly_consistency':
        return `${score} jours/semaine`;
      case 'morning_workouts':
        return `${score} séances matinales`;
      case 'weekend_workouts':
        return `${score} séances weekend`;
      
      // Défis de variété
      case 'muscle_groups':
        return `${score} groupes`;
      case 'cardio_sessions':
        return `${score} séances cardio`;
      case 'strength_sessions':
        return `${score} séances force`;
      
      // Défis de performance
      case 'long_workouts':
        return `${score} séances longues`;
      case 'intensity':
        return `${score}% intensité`;
      case 'volume':
        return `${score} kg total`;
      
      default:
        return score;
    }
  }, []);

  const getChallengeStatus = useCallback((challenge) => {
    const now = new Date();
    const endDate = new Date(challenge.endDate);
    if (now > endDate) {
      const myScore = getChallengeScore(challenge);
      const friendScore = challenge.friendScore || 0;
      
      // Vérifier si c'est une victoire et ajouter de l'XP
      if (myScore > friendScore && challenge.status !== 'completed' && addChallengeWinXP) {
        // Marquer le défi comme terminé et ajouter de l'XP
        updateChallenge(challenge.id, { status: 'completed' }).then(() => {
          const challengeName = `${challenge.type} vs ${challenge.receiverName}`;
          addChallengeWinXP(challengeName).then(result => {
            // Défi gagné avec succès
          }).catch(error => {
            console.error('Erreur lors de l\'ajout d\'XP pour victoire:', error);
          });
        });
        return { status: 'victory', text: 'Victoire ! 🎉' };
      }
      
      if (myScore > friendScore) return { status: 'victory', text: 'Victoire ! 🎉' };
      if (friendScore > myScore) return { status: 'defeat', text: 'Défaite 😔' };
      return { status: 'tie', text: 'Égalité 🤝' };
    }
    return { status: 'active', text: 'En cours...' };
  }, [getChallengeScore, updateChallenge, addChallengeWinXP]);

  const getSentChallenges = useCallback(() => {
    return challenges.filter(challenge => challenge.senderId === user?.uid);
  }, [challenges, user]);

  const getReceivedChallenges = useCallback(() => {
    return challenges.filter(challenge => challenge.receiverId === user?.uid);
  }, [challenges, user]);

  const getAllUserChallenges = useCallback(() => {
    return challenges.filter(challenge =>
      challenge.senderId === user?.uid || challenge.receiverId === user?.uid
    );
  }, [challenges, user]);

  const acceptChallenge = useCallback(async (challengeId) => {
    try {
      await updateChallenge(challengeId, {
        status: 'accepted',
        acceptedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Erreur lors de l'acceptation du défi:", error);
      throw error;
    }
  }, [updateChallenge]);

  const declineChallenge = useCallback(async (challengeId) => {
    try {
      await updateChallenge(challengeId, {
        status: 'declined',
        declinedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors du refus du défi:', error);
      throw error;
    }
  }, [updateChallenge]);

  const cancelChallenge = useCallback(async (challengeId) => {
    try {
      await updateChallenge(challengeId, {
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Erreur lors de l'annulation du défi:", error);
      throw error;
    }
  }, [updateChallenge]);

  if (!user?.uid) {
    return {
      challenges: [],
      loading: true,
      createChallenge: async () => null,
      updateChallenge: async () => {},
      deleteChallenge: async () => {},
      getChallengeScore: () => 0,
      getActiveChallenges: () => [],
      getCompletedChallenges: () => [],
      formatScore: () => '',
      getChallengeStatus: () => ({ status: 'loading', text: 'Chargement...' }),
      getSentChallenges: () => [],
      getReceivedChallenges: () => [],
      getAllUserChallenges: () => [],
      acceptChallenge: async () => {},
      declineChallenge: async () => {},
      cancelChallenge: async () => {},
      challengeTypes
    };
  }

  return {
    challenges,
    loading,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    getChallengeScore,
    getActiveChallenges,
    getCompletedChallenges,
    formatScore,
    getChallengeStatus,
    getSentChallenges,
    getReceivedChallenges,
    getAllUserChallenges,
    acceptChallenge,
    declineChallenge,
    cancelChallenge,
    challengeTypes,
    challengeDurations,
    challengeTargets
  };
}; 