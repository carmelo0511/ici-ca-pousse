import { useMemo, useEffect, useState } from 'react';
import { BADGE_TYPES } from '../constants/badges';
import { saveUserBadges } from '../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

// Fonction pour calculer les badges d'un utilisateur
export function calculateUserBadges(workouts = [], challenges = [], user) {
  const badges = [];

  if (!workouts || workouts.length === 0) {
    return badges;
  }

  // Badge première séance
  if (workouts.length >= 1) {
    badges.push(BADGE_TYPES.FIRST_WORKOUT);
  }

  // Badges de séries d'entraînement
  const sortedWorkouts = [...workouts].sort((a, b) => new Date(a.date) - new Date(b.date));
  let currentStreak = 1;
  let maxStreak = 1;

  for (let i = 1; i < sortedWorkouts.length; i++) {
    const prevDate = new Date(sortedWorkouts[i - 1].date);
    const currDate = new Date(sortedWorkouts[i].date);
    const dayDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

    if (dayDiff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  // Badges de séries
  if (maxStreak >= 3) badges.push(BADGE_TYPES.WORKOUT_STREAK);
  if (maxStreak >= 5) badges.push(BADGE_TYPES.STREAK_5);
  if (maxStreak >= 10) badges.push(BADGE_TYPES.STREAK_10);
  if (maxStreak >= 20) badges.push(BADGE_TYPES.STREAK_20);
  if (maxStreak >= 30) badges.push(BADGE_TYPES.STREAK_30);
  if (maxStreak >= 50) badges.push(BADGE_TYPES.STREAK_50);
  if (maxStreak >= 100) badges.push(BADGE_TYPES.STREAK_100);

  // Badges de poids
  let maxWeight = 0;
  workouts.forEach(workout => {
    workout.exercises?.forEach(exercise => {
      exercise.sets?.forEach(set => {
        if (set.weight > maxWeight) {
          maxWeight = set.weight;
        }
      });
    });
  });

  if (maxWeight >= 50) badges.push(BADGE_TYPES.WEIGHT_50);
  if (maxWeight >= 75) badges.push(BADGE_TYPES.WEIGHT_75);
  if (maxWeight >= 100) badges.push(BADGE_TYPES.WEIGHT_100);
  if (maxWeight >= 125) badges.push(BADGE_TYPES.WEIGHT_125);
  if (maxWeight >= 150) badges.push(BADGE_TYPES.WEIGHT_150);
  if (maxWeight >= 200) badges.push(BADGE_TYPES.WEIGHT_200);
  if (maxWeight >= 250) badges.push(BADGE_TYPES.WEIGHT_250);

  // Badges de séances totales
  if (workouts.length >= 10) badges.push(BADGE_TYPES.WORKOUTS_10);
  if (workouts.length >= 25) badges.push(BADGE_TYPES.WORKOUTS_25);
  if (workouts.length >= 50) badges.push(BADGE_TYPES.WORKOUTS_50);
  if (workouts.length >= 100) badges.push(BADGE_TYPES.WORKOUTS_100);
  if (workouts.length >= 250) badges.push(BADGE_TYPES.WORKOUTS_250);
  if (workouts.length >= 500) badges.push(BADGE_TYPES.WORKOUTS_500);

  // Badges de régularité hebdomadaire
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentWorkouts = workouts.filter(w => new Date(w.date) >= oneWeekAgo);
  
  if (recentWorkouts.length >= 3) badges.push(BADGE_TYPES.WEEKLY_3);
  if (recentWorkouts.length >= 5) badges.push(BADGE_TYPES.WEEKLY_5);
  if (recentWorkouts.length >= 7) badges.push(BADGE_TYPES.WEEKLY_7);

  // Badges de régularité mensuelle
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const monthlyWorkouts = workouts.filter(w => new Date(w.date) >= oneMonthAgo);
  
  if (monthlyWorkouts.length >= 10) badges.push(BADGE_TYPES.MONTHLY_10);
  if (monthlyWorkouts.length >= 20) badges.push(BADGE_TYPES.MONTHLY_20);
  if (monthlyWorkouts.length >= 30) badges.push(BADGE_TYPES.MONTHLY_30);

  // Badges de défis
  const wonChallenges = challenges.filter(challenge => 
    challenge.winnerId === user?.uid && challenge.status === 'completed'
  );
  
  if (wonChallenges.length >= 1) badges.push(BADGE_TYPES.CHALLENGE_WINNER);
  if (wonChallenges.length >= 5) badges.push(BADGE_TYPES.CHALLENGE_5);
  if (wonChallenges.length >= 10) badges.push(BADGE_TYPES.CHALLENGE_10);
  if (wonChallenges.length >= 25) badges.push(BADGE_TYPES.CHALLENGE_25);
  if (wonChallenges.length >= 50) badges.push(BADGE_TYPES.CHALLENGE_50);

  // Badges d'exercices spécifiques
  const exerciseCounts = {};
  workouts.forEach(workout => {
    workout.exercises?.forEach(exercise => {
      exerciseCounts[exercise.name] = (exerciseCounts[exercise.name] || 0) + 1;
    });
  });

  if (exerciseCounts['Développé couché'] >= 10) badges.push(BADGE_TYPES.BENCH_MASTER);
  if (exerciseCounts['Squat'] >= 10) badges.push(BADGE_TYPES.SQUAT_MASTER);
  if (exerciseCounts['Soulevé de terre'] >= 10) badges.push(BADGE_TYPES.DEADLIFT_MASTER);
  if (exerciseCounts['Tractions'] >= 10) badges.push(BADGE_TYPES.PULLUP_MASTER);
  if (exerciseCounts['Pompes'] >= 10) badges.push(BADGE_TYPES.PUSHUP_MASTER);

  // Badges de temps
  const earlyWorkouts = workouts.filter(w => {
    const hour = new Date(w.date).getHours();
    return hour < 8;
  });
  if (earlyWorkouts.length >= 5) badges.push(BADGE_TYPES.EARLY_BIRD);

  const nightWorkouts = workouts.filter(w => {
    const hour = new Date(w.date).getHours();
    return hour >= 22;
  });
  if (nightWorkouts.length >= 5) badges.push(BADGE_TYPES.NIGHT_OWL);

  const weekendWorkouts = workouts.filter(w => {
    const day = new Date(w.date).getDay();
    return day === 0 || day === 6;
  });
  if (weekendWorkouts.length >= 10) badges.push(BADGE_TYPES.WEEKEND_WARRIOR);

  // Badges spéciaux
  if (workouts.length >= 100) badges.push(BADGE_TYPES.GOLDEN_MEMBER);
  if (workouts.length >= 50) badges.push(BADGE_TYPES.SILVER_MEMBER);
  if (workouts.length >= 25) badges.push(BADGE_TYPES.BRONZE_MEMBER);
  if (workouts.length >= 500) badges.push(BADGE_TYPES.PLATINUM_MEMBER);

  // Badges de saison (simplifiés)
  const currentMonth = new Date().getMonth();
  if (currentMonth >= 2 && currentMonth <= 4) badges.push(BADGE_TYPES.SPRING_TRAINER);
  if (currentMonth >= 5 && currentMonth <= 7) badges.push(BADGE_TYPES.SUMMER_WARRIOR);
  if (currentMonth >= 8 && currentMonth <= 10) badges.push(BADGE_TYPES.AUTUMN_STRENGTH);
  if (currentMonth === 11 || currentMonth <= 1) badges.push(BADGE_TYPES.WINTER_CHAMPION);

  // Badges de variété
  const uniqueExercises = Object.keys(exerciseCounts).length;
  if (uniqueExercises >= 10) badges.push(BADGE_TYPES.EXERCISE_EXPLORER);
  if (uniqueExercises >= 20) badges.push(BADGE_TYPES.VARIETY_KING);

  // Badges de motivation (simplifiés)
  if (workouts.length >= 50 && maxStreak >= 10) badges.push(BADGE_TYPES.MOTIVATION_MASTER);
  if (workouts.length >= 100) badges.push(BADGE_TYPES.CONSISTENCY_KING);
  if (workouts.length >= 25) badges.push(BADGE_TYPES.PROGRESS_MAKER);

  // Badges de performance (simplifiés)
  if (maxWeight >= 150) badges.push(BADGE_TYPES.STRENGTH_LEGEND);
  if (workouts.length >= 100) badges.push(BADGE_TYPES.ENDURANCE_KING);

  // Badges de records
  if (maxWeight >= 200) badges.push(BADGE_TYPES.PERSONAL_BEST);
  if (workouts.length >= 1000) badges.push(BADGE_TYPES.WORLD_RECORD);

  // Badges d'équipe/solo
  if (challenges.length > 0) badges.push(BADGE_TYPES.TEAM_PLAYER);
  if (workouts.length >= 50 && challenges.length === 0) badges.push(BADGE_TYPES.SOLO_CHAMPION);

  // Badges de routine
  if (workouts.length >= 100) badges.push(BADGE_TYPES.ROUTINE_MASTER);
  if (uniqueExercises >= 5) badges.push(BADGE_TYPES.SPECIALIST);

  // Badges d'anime japonais
  // Naruto Runner - Course rapide
  const fastWorkouts = workouts.filter(w => {
    const duration = w.duration || 0;
    return duration < 30; // Séances de moins de 30 minutes
  });
  if (fastWorkouts.length >= 10) badges.push(BADGE_TYPES.NARUTO_RUNNER);

  // Dragon Ball Warrior - Force surhumaine
  if (maxWeight >= 200) badges.push(BADGE_TYPES.DRAGON_BALL_WARRIOR);

  // One Piece Navigator - Navigation dans les défis
  if (challenges.length >= 10) badges.push(BADGE_TYPES.ONE_PIECE_NAVIGATOR);

  // Attack on Titan Soldier - Courage face aux défis
  const difficultChallenges = challenges.filter(c => c.duration >= 30);
  if (difficultChallenges.length >= 5) badges.push(BADGE_TYPES.ATTACK_ON_TITAN_SOLDIER);

  // Demon Slayer Hashira - Techniques avancées
  if (uniqueExercises >= 15) badges.push(BADGE_TYPES.DEMON_SLAYER_HASHIRA);

  // My Hero Academia Hero - Héros en devenir
  if (workouts.length >= 50 && maxStreak >= 15) badges.push(BADGE_TYPES.MY_HERO_ACADEMIA_HERO);

  // Pokemon Trainer - Collectionneur de badges
  const totalBadgesEarned = workouts.length >= 10 ? 1 : 0 + 
                           (maxStreak >= 5 ? 1 : 0) + 
                           (maxWeight >= 100 ? 1 : 0) + 
                           (challenges.length >= 5 ? 1 : 0) +
                           (uniqueExercises >= 5 ? 1 : 0) +
                           (workouts.length >= 25 ? 1 : 0) +
                           (workouts.length >= 50 ? 1 : 0) +
                           (workouts.length >= 100 ? 1 : 0) +
                           (wonChallenges.length >= 5 ? 1 : 0) +
                           (earlyWorkouts.length >= 5 ? 1 : 0);
  if (totalBadgesEarned >= 10) badges.push(BADGE_TYPES.POKEMON_TRAINER);

  // Sailor Moon Guardian - Protectrice de la motivation
  if (workouts.length >= 100 && maxStreak >= 20) badges.push(BADGE_TYPES.SAILOR_MOON_GUARDIAN);

  // Bleach Soul Reaper - Maître de la discipline
  if (workouts.length >= 200) badges.push(BADGE_TYPES.BLEACH_SOUL_REAPER);

  // Fullmetal Alchemist - Transmutation parfaite
  if (maxWeight >= 150 && workouts.length >= 75) badges.push(BADGE_TYPES.FULLMETAL_ALCHEMIST);

  // Death Note Detective - Stratégie et planification
  if (challenges.length >= 20) badges.push(BADGE_TYPES.DEATH_NOTE_DETECTIVE);

  // Tokyo Ghoul Investigator - Perception aiguisée
  if (uniqueExercises >= 25) badges.push(BADGE_TYPES.TOKYO_GHOUL_INVESTIGATOR);

  // Hunter x Hunter Hunter - Chasseur d'objectifs
  if (workouts.length >= 150) badges.push(BADGE_TYPES.HUNTER_X_HUNTER_HUNTER);

  // Fairy Tail Mage - Magie de l'amitié
  if (challenges.length >= 15 && wonChallenges.length >= 10) badges.push(BADGE_TYPES.FAIRY_TAIL_MAGE);

  // Sword Art Online Player - Maître du virtuel
  if (workouts.length >= 300) badges.push(BADGE_TYPES.SWORD_ART_ONLINE_PLAYER);

  // JoJo Bizarre Adventure - Style et pose parfaits
  if (maxWeight >= 100 && uniqueExercises >= 10) badges.push(BADGE_TYPES.JOJO_BIZARRE_ADVENTURE);

  // Evangelion Pilot - Synchronisation parfaite
  if (workouts.length >= 250 && maxStreak >= 30) badges.push(BADGE_TYPES.EVANGELION_PILOT);

  // Ghost in the Shell - Conscience augmentée
  if (workouts.length >= 400) badges.push(BADGE_TYPES.GHOST_IN_THE_SHELL);

  // Akira Psychic - Pouvoirs psychiques
  if (maxWeight >= 300) badges.push(BADGE_TYPES.AKIRA_PSYCHIC);

  // Cowboy Bebop Bounty - Chasseur de records
  if (workouts.length >= 500) badges.push(BADGE_TYPES.COWBOY_BEBOP_BOUNTY);

  return [...new Set(badges)]; // Supprimer les doublons
}

// Hook pour utiliser les badges
export function useBadges(workouts, challenges, user, addBadgeUnlockXP) {
  const [storedBadges, setStoredBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les badges stockés dans Firebase
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadStoredBadges = async () => {
      try {
        setLoading(true);
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setStoredBadges(userData.badges || []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des badges stockés:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredBadges();

    // Écouter l'événement de rafraîchissement des badges
    const handleRefreshBadges = () => {
      loadStoredBadges();
    };

    window.addEventListener('refreshBadges', handleRefreshBadges);

    return () => {
      window.removeEventListener('refreshBadges', handleRefreshBadges);
    };
  }, [user?.uid]);

  // Calculer les badges automatiques
  const calculatedBadges = useMemo(() => {
    return calculateUserBadges(workouts, challenges, user);
  }, [workouts, challenges, user]);

  // Combiner les badges calculés avec les badges stockés
  const allBadges = useMemo(() => {
    const combined = [...new Set([...calculatedBadges, ...storedBadges])];
    return combined;
  }, [calculatedBadges, storedBadges]);

  const badgeCount = allBadges.length;

  // Sauvegarder automatiquement les badges dans Firebase quand ils changent
  useEffect(() => {
    if (user && user.uid && allBadges.length > 0 && !loading) {
      // Vérifier si les badges ont changé par rapport à ceux stockés
      const currentBadges = user.badges || [];
      const hasChanged = allBadges.length !== currentBadges.length || 
                        !allBadges.every(badge => currentBadges.includes(badge));
      
      if (hasChanged) {
        saveUserBadges(user.uid, allBadges).catch(error => {
          console.error('Erreur lors de la sauvegarde des badges:', error);
        });
        
        // Ajouter de l'XP pour les nouveaux badges débloqués
        if (addBadgeUnlockXP) {
          const newBadges = allBadges.filter(badge => !currentBadges.includes(badge));
          newBadges.forEach(async (badge) => {
            try {
              await addBadgeUnlockXP(badge);
              // Badge débloqué avec succès
            } catch (error) {
              console.error('Erreur lors de l\'ajout d\'XP pour badge:', error);
            }
          });
        }
      }
    }
  }, [allBadges, user, addBadgeUnlockXP, loading]);

  return {
    badges: allBadges,
    badgeCount,
    hasBadge: (badgeType) => allBadges.includes(badgeType),
    selectedBadge: user?.selectedBadge || null,
    loading
  };
} 