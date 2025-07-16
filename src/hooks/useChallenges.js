import { useState, useEffect } from 'react';
import { 
  createChallengeInFirebase, 
  getChallengesFromFirebase, 
  updateChallengeInFirebase, 
  deleteChallengeFromFirebase 
} from '../utils/firebase';
import { getWorkoutsForDateRange } from '../utils/workoutUtils';
import { useWorkouts } from './useWorkouts';

export const useChallenges = (user) => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const { workouts } = useWorkouts(user);

  // Types de défis disponibles
  const challengeTypes = [
    { id: 'workouts', label: 'Nombre de séances', icon: '💪' },
    { id: 'duration', label: 'Temps d\'entraînement', icon: '⏱️' },
    { id: 'streak', label: 'Série consécutive', icon: '🔥' },
    { id: 'calories', label: 'Calories brûlées', icon: '🔥' }
  ];

  const loadChallenges = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const challenges = await getChallengesFromFirebase(user.uid);
      setChallenges(challenges);
    } catch (error) {
      console.error('Erreur lors du chargement des défis:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, [user]);

  const createChallenge = async (challengeData) => {
    if (!user) return null;

    console.log('🔧 Création d\'un défi avec les données:', challengeData);

    const newChallenge = {
      senderId: user.uid,
      senderName: user.displayName || user.email,
      receiverId: challengeData.friend.uid,
      receiverName: challengeData.friend.displayName || challengeData.friend.email,
      type: challengeData.type,
      target: challengeData.target,
      duration: challengeData.duration,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + challengeData.duration * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      myScore: 0,
      friendScore: 0,
      winner: null
    };

    console.log('📝 Défi à créer:', newChallenge);

    try {
      const createdChallenge = await createChallengeInFirebase(newChallenge);
      console.log('✅ Défi créé avec succès:', createdChallenge);
      setChallenges(prev => [...prev, createdChallenge]);
      return createdChallenge;
    } catch (error) {
      console.error('❌ Erreur lors de la création du défi:', error);
      throw error;
    }
  };

  const updateChallenge = async (challengeId, updates) => {
    try {
      await updateChallengeInFirebase(challengeId, updates);
      setChallenges(prev => prev.map(challenge => 
        challenge.id === challengeId ? { ...challenge, ...updates } : challenge
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du défi:', error);
      throw error;
    }
  };

  const deleteChallenge = async (challengeId) => {
    try {
      await deleteChallengeFromFirebase(challengeId);
      setChallenges(prev => prev.filter(challenge => challenge.id !== challengeId));
    } catch (error) {
      console.error('Erreur lors de la suppression du défi:', error);
      throw error;
    }
  };

  const getChallengeScore = async (challenge, userId) => {
    try {
      const filteredWorkouts = getWorkoutsForDateRange(workouts, new Date(challenge.startDate), new Date(challenge.endDate));

      switch (challenge.type) {
        case 'workouts':
          return filteredWorkouts.length;
        case 'duration':
          return filteredWorkouts.reduce((total, workout) => total + (workout.duration || 0), 0);
        case 'streak':
          // Calcul de la série consécutive
          const sortedDates = filteredWorkouts
            .map(w => new Date(w.date))
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
        case 'calories':
          return filteredWorkouts.reduce((total, workout) => total + (workout.calories || 0), 0);
        default:
          return 0;
      }
    } catch (error) {
      console.error('Erreur lors du calcul du score:', error);
      return 0;
    }
  };

  const getActiveChallenges = () => {
    return challenges.filter(challenge => 
      (challenge.status === 'active' || challenge.status === 'pending' || challenge.status === 'accepted') && 
      new Date() <= new Date(challenge.endDate)
    );
  };

  const getCompletedChallenges = () => {
    return challenges.filter(challenge => 
      challenge.status === 'completed' || new Date() > new Date(challenge.endDate)
    );
  };

  const formatScore = (score, type) => {
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
  };

  const getChallengeStatus = async (challenge) => {
    const now = new Date();
    const endDate = new Date(challenge.endDate);
    
    if (now > endDate) {
      const myScore = await getChallengeScore(challenge, user.uid);
      const friendScore = challenge.friendScore || 0;
      
      if (myScore > friendScore) return { status: 'victory', text: 'Victoire ! 🎉' };
      if (friendScore > myScore) return { status: 'defeat', text: 'Défaite 😔' };
      return { status: 'tie', text: 'Égalité 🤝' };
    }
    
    return { status: 'active', text: 'En cours...' };
  };

  const getSentChallenges = () => {
    return challenges.filter(challenge => challenge.senderId === user.uid);
  };

  const getReceivedChallenges = () => {
    return challenges.filter(challenge => challenge.receiverId === user.uid);
  };

  const getAllUserChallenges = () => {
    return challenges.filter(challenge => 
      challenge.senderId === user.uid || challenge.receiverId === user.uid
    );
  };

  const acceptChallenge = async (challengeId) => {
    try {
      await updateChallenge(challengeId, { 
        status: 'accepted', 
        acceptedAt: new Date().toISOString() 
      });
    } catch (error) {
      console.error('Erreur lors de l\'acceptation du défi:', error);
      throw error;
    }
  };

  const declineChallenge = async (challengeId) => {
    try {
      await updateChallenge(challengeId, { 
        status: 'declined', 
        declinedAt: new Date().toISOString() 
      });
    } catch (error) {
      console.error('Erreur lors du refus du défi:', error);
      throw error;
    }
  };

  const cancelChallenge = async (challengeId) => {
    try {
      await updateChallenge(challengeId, { 
        status: 'cancelled', 
        cancelledAt: new Date().toISOString() 
      });
    } catch (error) {
      console.error('Erreur lors de l\'annulation du défi:', error);
      throw error;
    }
  };

  return {
    challenges,
    loading,
    challengeTypes,
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
    loadChallenges
  };
}; 