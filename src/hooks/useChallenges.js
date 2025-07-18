import { useState, useEffect, useCallback } from 'react';
import {
  createChallengeInFirebase,
  getChallengesFromFirebase,
  updateChallengeInFirebase,
  deleteChallengeFromFirebase
} from '../utils/firebase';
import { getWorkoutsForDateRange } from '../utils/workoutUtils';
import { useWorkouts } from './useWorkouts';

export const useChallenges = (user, addChallengeSendXP, addChallengeWinXP) => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const { workouts } = useWorkouts(user);

  // Types de défis disponibles
  const challengeTypes = [
    { id: 'workouts', label: 'Nombre de séances', icon: '💪' },
    { id: 'duration', label: "Temps d'entraînement", icon: '⏱️' },
    { id: 'streak', label: 'Série consécutive', icon: '🔥' },
    { id: 'calories', label: 'Calories brûlées', icon: '🔥' }
  ];

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
        case 'workouts':
          return filteredWorkouts.length;
        case 'duration':
          return filteredWorkouts.reduce((total, workout) => total + (workout.duration || 0), 0);
        case 'streak': {
          // S'assurer que les dates de workout sont bien des objets Date
          const sortedDates = filteredWorkouts
            .map(w => typeof w.date === 'string' ? new Date(w.date) : w.date)
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
        case 'calories':
          return filteredWorkouts.reduce((total, workout) => total + (workout.calories || 0), 0);
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
      case 'duration':
        return `${score} min`;
      case 'calories':
        return `${score} cal`;
      case 'streak':
        return `${score} jours`;
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
    challengeTypes
  };
}; 