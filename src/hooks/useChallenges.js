import { useState, useEffect, useCallback } from 'react';
import { useWorkouts } from './useWorkouts';

export const useChallenges = (user) => {
  const [challenges, setChallenges] = useState([]);
  const { workouts } = useWorkouts(user);

  // Types de défis disponibles
  const challengeTypes = [
    { id: 'workouts', label: 'Nombre de séances', icon: '💪' },
    { id: 'duration', label: 'Temps d\'entraînement', icon: '⏱️' },
    { id: 'streak', label: 'Série consécutive', icon: '🔥' },
    { id: 'calories', label: 'Calories brûlées', icon: '🔥' }
  ];

  const loadChallenges = useCallback(() => {
    if (!user) return;
    
    const savedChallenges = localStorage.getItem(`challenges_${user.uid}`);
    if (savedChallenges) {
      setChallenges(JSON.parse(savedChallenges));
    }
  }, [user]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const saveChallenges = (newChallenges) => {
    if (!user) return;
    
    localStorage.setItem(`challenges_${user.uid}`, JSON.stringify(newChallenges));
    setChallenges(newChallenges);
  };

  const createChallenge = (challengeData) => {
    const newChallenge = {
      id: Date.now(),
      ...challengeData,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + challengeData.duration * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      myScore: 0,
      friendScore: 0,
      winner: null,
      createdAt: new Date().toISOString()
    };

    const updatedChallenges = [...challenges, newChallenge];
    saveChallenges(updatedChallenges);
    return newChallenge;
  };

  const updateChallenge = (challengeId, updates) => {
    const updatedChallenges = challenges.map(challenge => 
      challenge.id === challengeId ? { ...challenge, ...updates } : challenge
    );
    saveChallenges(updatedChallenges);
  };

  const deleteChallenge = (challengeId) => {
    const updatedChallenges = challenges.filter(challenge => challenge.id !== challengeId);
    saveChallenges(updatedChallenges);
  };

  const getChallengeScore = (challenge) => {
    const filteredWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= new Date(challenge.startDate) && workoutDate <= new Date(challenge.endDate);
    });

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
  };

  const getActiveChallenges = () => {
    return challenges.filter(challenge => 
      challenge.status === 'active' && new Date() <= new Date(challenge.endDate)
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

  const getChallengeStatus = (challenge) => {
    const now = new Date();
    const endDate = new Date(challenge.endDate);
    
    if (now > endDate) {
      const myScore = getChallengeScore(challenge);
      const friendScore = challenge.friendScore || 0;
      
      if (myScore > friendScore) return { status: 'victory', text: 'Victoire ! 🎉' };
      if (friendScore > myScore) return { status: 'defeat', text: 'Défaite 😔' };
      return { status: 'tie', text: 'Égalité 🤝' };
    }
    
    return { status: 'active', text: 'En cours...' };
  };

  const getDetailedStats = () => {
    const totalChallenges = challenges.length;
    const completedChallenges = challenges.filter(challenge => 
      new Date() > new Date(challenge.endDate)
    );
    const activeChallenges = challenges.filter(challenge => 
      new Date() <= new Date(challenge.endDate)
    );

    const victories = completedChallenges.filter(challenge => {
      const myScore = getChallengeScore(challenge);
      const friendScore = challenge.friendScore || 0;
      return myScore > friendScore;
    }).length;

    const defeats = completedChallenges.filter(challenge => {
      const myScore = getChallengeScore(challenge);
      const friendScore = challenge.friendScore || 0;
      return friendScore > myScore;
    }).length;

    const ties = completedChallenges.filter(challenge => {
      const myScore = getChallengeScore(challenge);
      const friendScore = challenge.friendScore || 0;
      return myScore === friendScore;
    }).length;

    const winRate = completedChallenges.length > 0 ? Math.round((victories / completedChallenges.length) * 100) : 0;

    // Stats par type de défi
    const statsByType = {};
    challengeTypes.forEach(type => {
      const typeChallenges = challenges.filter(c => c.type === type.id);
      const typeCompleted = typeChallenges.filter(c => new Date() > new Date(c.endDate));
      const typeVictories = typeCompleted.filter(c => {
        const myScore = getChallengeScore(c);
        const friendScore = c.friendScore || 0;
        return myScore > friendScore;
      }).length;
      
      statsByType[type.id] = {
        total: typeChallenges.length,
        completed: typeCompleted.length,
        victories: typeVictories,
        winRate: typeCompleted.length > 0 ? Math.round((typeVictories / typeCompleted.length) * 100) : 0
      };
    });

    // Ami le plus challengé
    const friendStats = {};
    challenges.forEach(challenge => {
      const friendId = challenge.friend.id;
      if (!friendStats[friendId]) {
        friendStats[friendId] = {
          name: challenge.friend.name,
          total: 0,
          victories: 0,
          defeats: 0
        };
      }
      friendStats[friendId].total++;
      
      if (new Date() > new Date(challenge.endDate)) {
        const myScore = getChallengeScore(challenge);
        const friendScore = challenge.friendScore || 0;
        if (myScore > friendScore) {
          friendStats[friendId].victories++;
        } else if (friendScore > myScore) {
          friendStats[friendId].defeats++;
        }
      }
    });

    return {
      overview: {
        total: totalChallenges,
        active: activeChallenges.length,
        completed: completedChallenges.length,
        victories,
        defeats,
        ties,
        winRate
      },
      byType: statsByType,
      byFriend: friendStats
    };
  };

  return {
    challenges,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    getChallengeScore,
    getActiveChallenges,
    getCompletedChallenges,
    formatScore,
    getChallengeStatus,
    getDetailedStats,
    loadChallenges
  };
}; 