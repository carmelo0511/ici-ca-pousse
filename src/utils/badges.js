// Système de badges pour récompenser les utilisateurs
import { parseLocalDate } from './workoutUtils';

export const badges = {
  // Badges de séances
  firstWorkout: {
    id: 'firstWorkout',
    name: 'Premier Pas',
    description: 'Complète ta première séance',
    icon: '🎯',
    color: 'bg-blue-500',
    condition: (stats) => stats.totalWorkouts >= 1
  },
  workoutStreak: {
    id: 'workoutStreak',
    name: 'Série de Feu',
    description: '7 séances consécutives',
    icon: '🔥',
    color: 'bg-orange-500',
    condition: (stats) => stats.currentStreak >= 7
  },
  workoutMaster: {
    id: 'workoutMaster',
    name: 'Maître de l\'Entraînement',
    description: '50 séances complétées',
    icon: '💪',
    color: 'bg-purple-500',
    condition: (stats) => stats.totalWorkouts >= 50
  },
  workoutLegend: {
    id: 'workoutLegend',
    name: 'Légende du Fitness',
    description: '100 séances complétées',
    icon: '👑',
    color: 'bg-yellow-500',
    condition: (stats) => stats.totalWorkouts >= 100
  },

  // Badges de défis
  firstChallenge: {
    id: 'firstChallenge',
    name: 'Défieur Débutant',
    description: 'Crée ton premier défi',
    icon: '⚔️',
    color: 'bg-green-500',
    condition: (stats) => stats.totalChallenges >= 1
  },
  challengeWinner: {
    id: 'challengeWinner',
    name: 'Vainqueur',
    description: 'Gagne ton premier défi',
    icon: '🏆',
    color: 'bg-yellow-500',
    condition: (stats) => stats.challengeVictories >= 1
  },
  challengeMaster: {
    id: 'challengeMaster',
    name: 'Maître des Défis',
    description: 'Gagne 10 défis',
    icon: '👑',
    color: 'bg-purple-500',
    condition: (stats) => stats.challengeVictories >= 10
  },
  perfectWinRate: {
    id: 'perfectWinRate',
    name: 'Invincible',
    description: '100% de taux de victoire (min 5 défis)',
    icon: '⭐',
    color: 'bg-red-500',
    condition: (stats) => stats.challengeWinRate === 100 && stats.totalChallenges >= 5
  },

  // Badges de performance
  longWorkout: {
    id: 'longWorkout',
    name: 'Marathonien',
    description: 'Séance de plus de 2h',
    icon: '🏃',
    color: 'bg-indigo-500',
    condition: (stats) => stats.longestWorkout >= 120
  },
  calorieBurner: {
    id: 'calorieBurner',
    name: 'Brûleur de Calories',
    description: 'Brûle 1000 calories en une séance',
    icon: '🔥',
    color: 'bg-red-500',
    condition: (stats) => stats.maxCalories >= 1000
  },
  consistency: {
    id: 'consistency',
    name: 'Régularité',
    description: 'Séances 3 jours de suite',
    icon: '📅',
    color: 'bg-green-500',
    condition: (stats) => stats.currentStreak >= 3
  },

  // Badges sociaux
  socialButterfly: {
    id: 'socialButterfly',
    name: 'Papillon Social',
    description: 'Ajoute 5 amis',
    icon: '🦋',
    color: 'bg-pink-500',
    condition: (stats) => stats.totalFriends >= 5
  },
  teamPlayer: {
    id: 'teamPlayer',
    name: 'Joueur d\'Équipe',
    description: 'Participe à 5 défis',
    icon: '🤝',
    color: 'bg-blue-500',
    condition: (stats) => stats.totalChallenges >= 5
  },

  // Badges spéciaux
  earlyBird: {
    id: 'earlyBird',
    name: 'Lève-tôt',
    description: 'Séance avant 7h du matin',
    icon: '🌅',
    color: 'bg-yellow-400',
    condition: (stats) => stats.earlyWorkouts >= 1
  },
  nightOwl: {
    id: 'nightOwl',
    name: 'Oiseau de Nuit',
    description: 'Séance après 22h',
    icon: '🦉',
    color: 'bg-gray-700',
    condition: (stats) => stats.lateWorkouts >= 1
  },
  weekendWarrior: {
    id: 'weekendWarrior',
    name: 'Guerrier du Weekend',
    description: 'Séances 3 weekends de suite',
    icon: '⚔️',
    color: 'bg-orange-500',
    condition: (stats) => stats.weekendStreak >= 3
  }
};

// Fonction pour calculer les statistiques nécessaires aux badges
export const calculateBadgeStats = (workouts, challenges, friends) => {
  if (!workouts || workouts.length === 0) {
    return {
      totalWorkouts: 0,
      currentStreak: 0,
      longestWorkout: 0,
      maxCalories: 0,
      earlyWorkouts: 0,
      lateWorkouts: 0,
      weekendStreak: 0,
      totalChallenges: challenges?.length || 0,
      challengeVictories: 0,
      challengeWinRate: 0,
      totalFriends: friends?.length || 0
    };
  }

  // Calcul du streak actuel
  const sortedWorkouts = [...workouts].sort(
    (a, b) => parseLocalDate(b.date) - parseLocalDate(a.date)
  );
  let currentStreak = 0;
  let lastDate = null;

  for (let i = 0; i < sortedWorkouts.length; i++) {
    const workoutDate = parseLocalDate(sortedWorkouts[i].date);
    const workoutDay = new Date(
      workoutDate.getFullYear(),
      workoutDate.getMonth(),
      workoutDate.getDate()
    );
    
    if (!lastDate || (lastDate - workoutDay) / (1000 * 60 * 60 * 24) === 1) {
      currentStreak++;
      lastDate = workoutDay;
    } else {
      break;
    }
  }

  // Calcul des autres stats
  const longestWorkout = Math.max(...workouts.map(w => w.duration || 0));
  const maxCalories = Math.max(...workouts.map(w => w.calories || 0));
  
  const earlyWorkouts = workouts.filter(w => {
    const hour = parseLocalDate(w.date).getHours();
    return hour < 7;
  }).length;

  const lateWorkouts = workouts.filter(w => {
    const hour = parseLocalDate(w.date).getHours();
    return hour >= 22;
  }).length;

  // Calcul du weekend streak (simplifié)
  const weekendStreak = Math.min(currentStreak, 3);

  // Stats des défis
  const totalChallenges = challenges?.length || 0;
  const completedChallenges = challenges?.filter(c => new Date() > new Date(c.endDate)) || [];
  const challengeVictories = completedChallenges.filter(c => {
    // Logique simplifiée pour déterminer la victoire
    return Math.random() > 0.5; // Simulation
  }).length;
  const challengeWinRate = completedChallenges.length > 0 ? Math.round((challengeVictories / completedChallenges.length) * 100) : 0;

  return {
    totalWorkouts: workouts.length,
    currentStreak,
    longestWorkout,
    maxCalories,
    earlyWorkouts,
    lateWorkouts,
    weekendStreak,
    totalChallenges,
    challengeVictories,
    challengeWinRate,
    totalFriends: friends?.length || 0
  };
};

// Fonction pour obtenir les badges débloqués
export const getUnlockedBadges = (stats) => {
  const unlockedBadges = [];
  
  Object.values(badges).forEach(badge => {
    if (badge.condition(stats)) {
      unlockedBadges.push(badge);
    }
  });
  
  return unlockedBadges;
};

// Fonction pour obtenir les badges verrouillés
export const getLockedBadges = (stats) => {
  const lockedBadges = [];
  
  Object.values(badges).forEach(badge => {
    if (!badge.condition(stats)) {
      lockedBadges.push(badge);
    }
  });
  
  return lockedBadges;
};

// Fonction pour obtenir le progrès vers un badge
export const getBadgeProgress = (badgeId, stats) => {
  const badge = badges[badgeId];
  if (!badge) return null;

  // Logique spécifique pour chaque badge
  switch (badgeId) {
    case 'workoutMaster':
      return Math.min(100, (stats.totalWorkouts / 50) * 100);
    case 'workoutLegend':
      return Math.min(100, (stats.totalWorkouts / 100) * 100);
    case 'challengeMaster':
      return Math.min(100, (stats.challengeVictories / 10) * 100);
    case 'socialButterfly':
      return Math.min(100, (stats.totalFriends / 5) * 100);
    case 'teamPlayer':
      return Math.min(100, (stats.totalChallenges / 5) * 100);
    case 'workoutStreak':
      return Math.min(100, (stats.currentStreak / 7) * 100);
    default:
      return badge.condition(stats) ? 100 : 0;
  }
};

// Fonction pour obtenir tous les badges débloqués (alias de getUnlockedBadges)
export const getBadges = (stats) => {
  return getUnlockedBadges(stats);
}; 