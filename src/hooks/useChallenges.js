import { useState, useEffect, useCallback, useMemo } from 'react';
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

  // Système de récompenses par niveau de difficulté
  const challengeRewards = useMemo(() => ({
    bronze: { xp: 50, badge: '🥉', multiplier: 1, name: 'Bronze' },
    silver: { xp: 100, badge: '🥈', multiplier: 1.2, name: 'Argent' },
    gold: { xp: 200, badge: '🥇', multiplier: 1.5, name: 'Or' },
    platinum: { xp: 400, badge: '💎', multiplier: 2, name: 'Platine' },
    diamond: { xp: 800, badge: '💠', multiplier: 2.5, name: 'Diamant' },
    master: { xp: 1500, badge: '👑', multiplier: 3, name: 'Maître' }
  }), []);

  // Objectifs par type de défi avec niveaux de difficulté
  const challengeTargets = useMemo(() => ({
    workouts: [
      { value: 3, level: 'bronze' },
      { value: 5, level: 'silver' },
      { value: 7, level: 'gold' },
      { value: 10, level: 'platinum' },
      { value: 15, level: 'diamond' },
      { value: 20, level: 'master' }
    ],
    duration: [
      { value: 30, level: 'bronze' },
      { value: 60, level: 'silver' },
      { value: 90, level: 'gold' },
      { value: 120, level: 'platinum' },
      { value: 180, level: 'diamond' },
      { value: 240, level: 'master' }
    ],
    streak: [
      { value: 3, level: 'bronze' },
      { value: 5, level: 'silver' },
      { value: 7, level: 'gold' },
      { value: 10, level: 'platinum' },
      { value: 14, level: 'diamond' },
      { value: 21, level: 'master' }
    ],
    progression: [
      { value: 5, level: 'bronze' },
      { value: 10, level: 'silver' },
      { value: 15, level: 'gold' },
      { value: 20, level: 'platinum' },
      { value: 25, level: 'diamond' },
      { value: 30, level: 'master' }
    ],
    personal_records: [
      { value: 1, level: 'bronze' },
      { value: 3, level: 'silver' },
      { value: 5, level: 'gold' },
      { value: 7, level: 'platinum' },
      { value: 10, level: 'diamond' },
      { value: 15, level: 'master' }
    ],
    new_exercises: [
      { value: 2, level: 'bronze' },
      { value: 5, level: 'silver' },
      { value: 8, level: 'gold' },
      { value: 12, level: 'platinum' },
      { value: 15, level: 'diamond' },
      { value: 20, level: 'master' }
    ],
    weekly_consistency: [
      { value: 3, level: 'bronze' },
      { value: 4, level: 'silver' },
      { value: 5, level: 'gold' },
      { value: 6, level: 'platinum' },
      { value: 7, level: 'diamond' }
    ],
    morning_workouts: [
      { value: 2, level: 'bronze' },
      { value: 3, level: 'silver' },
      { value: 4, level: 'gold' },
      { value: 5, level: 'platinum' },
      { value: 6, level: 'diamond' },
      { value: 7, level: 'master' }
    ],
    weekend_workouts: [
      { value: 1, level: 'bronze' },
      { value: 2, level: 'silver' },
      { value: 3, level: 'gold' },
      { value: 4, level: 'platinum' }
    ],
    muscle_groups: [
      { value: 3, level: 'bronze' },
      { value: 4, level: 'silver' },
      { value: 5, level: 'gold' },
      { value: 6, level: 'platinum' },
      { value: 7, level: 'diamond' },
      { value: 8, level: 'master' }
    ],
    cardio_sessions: [
      { value: 2, level: 'bronze' },
      { value: 3, level: 'silver' },
      { value: 4, level: 'gold' },
      { value: 5, level: 'platinum' },
      { value: 6, level: 'diamond' },
      { value: 7, level: 'master' }
    ],
    strength_sessions: [
      { value: 2, level: 'bronze' },
      { value: 3, level: 'silver' },
      { value: 4, level: 'gold' },
      { value: 5, level: 'platinum' },
      { value: 6, level: 'diamond' },
      { value: 7, level: 'master' }
    ],
    long_workouts: [
      { value: 45, level: 'bronze' },
      { value: 60, level: 'silver' },
      { value: 75, level: 'gold' },
      { value: 90, level: 'platinum' },
      { value: 105, level: 'diamond' },
      { value: 120, level: 'master' }
    ],
    intensity: [
      { value: 70, level: 'bronze' },
      { value: 75, level: 'silver' },
      { value: 80, level: 'gold' },
      { value: 85, level: 'platinum' },
      { value: 90, level: 'diamond' },
      { value: 95, level: 'master' }
    ],
    volume: [
      { value: 1000, level: 'bronze' },
      { value: 2000, level: 'silver' },
      { value: 3000, level: 'gold' },
      { value: 5000, level: 'platinum' },
      { value: 7500, level: 'diamond' },
      { value: 10000, level: 'master' }
    ]
  }), []);

  // Fonction pour calculer le niveau atteint selon le score
  const calculateChallengeLevel = useCallback((score, type, target) => {
    const targets = challengeTargets[type] || [];
    let achievedLevel = null;
    
    for (let i = targets.length - 1; i >= 0; i--) {
      if (score >= targets[i].value) {
        achievedLevel = targets[i].level;
        break;
      }
    }
    
    return achievedLevel;
  }, [challengeTargets]);

  // Fonction pour calculer les récompenses
  const calculateChallengeRewards = useCallback((score, type, target, duration) => {
    const achievedLevel = calculateChallengeLevel(score, type, target);
    if (!achievedLevel) return null;
    
    const baseReward = challengeRewards[achievedLevel];
    const durationMultiplier = Math.min(duration / 7, 2); // Bonus pour les défis longs
    const finalXP = Math.round(baseReward.xp * baseReward.multiplier * durationMultiplier);
    
    return {
      level: achievedLevel,
      xp: finalXP,
      badge: baseReward.badge,
      name: baseReward.name,
      multiplier: baseReward.multiplier,
      durationBonus: durationMultiplier
    };
  }, [calculateChallengeLevel, challengeRewards]);

  // Fonction pour obtenir le prochain niveau à atteindre
  const getNextLevel = useCallback((score, type) => {
    const targets = challengeTargets[type] || [];
    
    for (const target of targets) {
      if (score < target.value) {
        return {
          level: target.level,
          value: target.value,
          remaining: target.value - score,
          reward: challengeRewards[target.level]
        };
      }
    }
    
    return null; // Niveau maximum atteint
  }, [challengeTargets, challengeRewards]);

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
      target: challengeData.target,
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

  // Fonction pour calculer le score d'un utilisateur spécifique
  const calculateUserScore = useCallback((userId, challenge) => {
    try {
      if (!userId || !challenge) return 0;
      
      // Filtrer les workouts de l'utilisateur pendant la période du défi
      const startDate = new Date(challenge.startDate);
      const endDate = new Date(challenge.endDate);
      
      const userWorkouts = workouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= startDate && workoutDate <= endDate;
      });
      
      // Calculer le score selon le type de défi
      switch (challenge.type) {
        case 'workouts':
          return userWorkouts.length;
          
        case 'duration':
          return userWorkouts.reduce((total, workout) => total + (workout.duration || 0), 0);
          
        case 'streak':
          // Calculer la plus longue série consécutive
          if (userWorkouts.length === 0) return 0;
          
          const sortedWorkouts = userWorkouts.sort((a, b) => new Date(a.date) - new Date(b.date));
          let maxStreak = 1;
          let currentStreak = 1;
          
          for (let i = 1; i < sortedWorkouts.length; i++) {
            const prevDate = new Date(sortedWorkouts[i-1].date);
            const currDate = new Date(sortedWorkouts[i].date);
            const daysDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1) {
              currentStreak++;
              maxStreak = Math.max(maxStreak, currentStreak);
            } else {
              currentStreak = 1;
            }
          }
          return maxStreak;
          
        // Ajouter d'autres types selon besoin...
        default:
          return userWorkouts.length;
      }
    } catch (error) {
      console.error('Erreur lors du calcul du score utilisateur:', error);
      return 0;
    }
  }, [workouts]);

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
      
      // Mettre à jour le score de l'utilisateur actuel dans le défi
      const isSentByMe = challenge.senderId === user?.uid;
      const scoreField = isSentByMe ? 'myScore' : 'friendScore';
      const currentScore = challenge[scoreField] || 0;
      
      if (currentScore !== myScore) {
        // Mettre à jour le score si nécessaire
        updateChallenge(challenge.id, { [scoreField]: myScore }).catch(error => {
          console.error('Erreur lors de la mise à jour du score:', error);
        });
      }
      
      // Déterminer les scores corrects
      // myScore = score calculé en temps réel de l'utilisateur actuel
      // friendScore = score stocké de l'autre utilisateur
      const myFinalScore = myScore; // Toujours le score calculé de l'utilisateur actuel
      const friendFinalScore = friendScore; // Toujours le score stocké de l'autre utilisateur
      
      // Vérifier si c'est une victoire et ajouter de l'XP avec récompenses
      if (myFinalScore > friendFinalScore) {
        const rewards = calculateChallengeRewards(myScore, challenge.type, challenge.target, challenge.duration);
        
        // Si le défi n'est pas encore marqué comme terminé, le marquer et ajouter de l'XP
        if (challenge.status !== 'completed' && addChallengeWinXP) {
          updateChallenge(challenge.id, { 
            status: 'completed',
            achievedLevel: rewards?.level,
            earnedXP: rewards?.xp,
            earnedBadge: rewards?.badge
          }).then(() => {
          const challengeName = `${challenge.type} vs ${challenge.receiverName}`;
            const xpToAdd = rewards?.xp || 100; // XP de base si pas de récompense calculée
            
            addChallengeWinXP(challengeName, xpToAdd).then(result => {
            // Défi gagné avec succès
              console.log(`Défi gagné ! XP: ${xpToAdd}, Niveau: ${rewards?.name || 'Standard'}`);
          }).catch(error => {
            console.error('Erreur lors de l\'ajout d\'XP pour victoire:', error);
          });
        });
        }
        
        const rewardText = rewards ? ` ${rewards.badge} +${rewards.xp}XP` : '';
        return { 
          status: 'victory', 
          text: `Victoire ! 🎉${rewardText}`,
          rewards: rewards
        };
      }
      if (friendFinalScore > myFinalScore) return { status: 'defeat', text: 'Défaite 😔' };
      return { status: 'tie', text: 'Égalité 🤝' };
    }
    return { status: 'active', text: 'En cours...' };
  }, [getChallengeScore, updateChallenge, addChallengeWinXP, calculateChallengeRewards, user?.uid]);

  const getSentChallenges = useCallback(() => {
    return challenges.filter(challenge => challenge.senderId === user?.uid);
  }, [challenges, user?.uid]);

  const getReceivedChallenges = useCallback(() => {
    return challenges.filter(challenge => challenge.receiverId === user?.uid);
  }, [challenges, user?.uid]);

  const getAllUserChallenges = useCallback(() => {
    return challenges.filter(challenge =>
      challenge.senderId === user?.uid || challenge.receiverId === user?.uid
    );
  }, [challenges, user?.uid]);

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
    challengeTargets,
    challengeRewards,
    calculateChallengeLevel,
    calculateChallengeRewards,
    getNextLevel,
    calculateUserScore
  };
}; 