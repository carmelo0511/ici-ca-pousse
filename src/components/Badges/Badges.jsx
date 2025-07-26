import React from 'react';
import { BADGE_TYPES } from '../../constants/badges';

// Configuration des badges
export const BADGE_CONFIG = {
  // Badges de base
  [BADGE_TYPES.FIRST_WORKOUT]: {
    name: 'Première séance',
    icon: '🎯',
    description: 'Première séance complétée',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  [BADGE_TYPES.WORKOUT_STREAK]: {
    name: 'Série d\'entraînement',
    icon: '🔥',
    description: '3 séances consécutives',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  [BADGE_TYPES.CONSISTENCY]: {
    name: 'Régularité',
    icon: '📅',
    description: '5 séances en 1 semaine',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  [BADGE_TYPES.WEIGHT_MASTER]: {
    name: 'Maître du poids',
    icon: '💪',
    description: 'Poids max > 100kg',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  [BADGE_TYPES.CHALLENGE_WINNER]: {
    name: 'Vainqueur de défi',
    icon: '🏆',
    description: 'A gagné un défi',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  [BADGE_TYPES.WEEKLY_GOAL]: {
    name: 'Objectif hebdomadaire',
    icon: '⭐',
    description: 'Objectif de la semaine atteint',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  [BADGE_TYPES.MONTHLY_GOAL]: {
    name: 'Objectif mensuel',
    icon: '🌟',
    description: 'Objectif du mois atteint',
    color: 'bg-pink-100 text-pink-800 border-pink-200'
  },
  
  // Badges de séries améliorés
  [BADGE_TYPES.STREAK_1]: {
    name: 'Débutant Motivé',
    icon: '🔥',
    description: 'Premier jour de streak !',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  [BADGE_TYPES.STREAK_3]: {
    name: 'Momentum',
    icon: '🔥🔥',
    description: '3 jours consécutifs',
    color: 'bg-pink-100 text-pink-800 border-pink-200'
  },
  [BADGE_TYPES.STREAK_7]: {
    name: 'Feu Sacré',
    icon: '🔥🔥🔥',
    description: '7 jours consécutifs',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  [BADGE_TYPES.STREAK_14]: {
    name: 'Régularité d\'Acier',
    icon: '🎯',
    description: '14 jours consécutifs',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  [BADGE_TYPES.STREAK_21]: {
    name: 'Habitude de Champion',
    icon: '💪',
    description: '21 jours consécutifs',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  [BADGE_TYPES.STREAK_30]: {
    name: 'Incroyable Détermination',
    icon: '🌟',
    description: '30 jours consécutifs',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  [BADGE_TYPES.STREAK_50]: {
    name: 'Mythe de la Musculation',
    icon: '⚡',
    description: '50 jours consécutifs',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  [BADGE_TYPES.STREAK_100]: {
    name: 'Légende du Fitness',
    icon: '👑',
    description: '100 jours consécutifs',
    color: 'bg-red-100 text-red-800 border-red-200'
  },
  
  // Badges de poids
  [BADGE_TYPES.WEIGHT_50]: {
    name: 'Poids 50kg',
    icon: '🏋️',
    description: 'Poids max 50kg',
    color: 'bg-gray-100 text-gray-800 border-gray-200'
  },
  [BADGE_TYPES.WEIGHT_75]: {
    name: 'Poids 75kg',
    icon: '🏋️',
    description: 'Poids max 75kg',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  [BADGE_TYPES.WEIGHT_100]: {
    name: 'Poids 100kg',
    icon: '🏋️',
    description: 'Poids max 100kg',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  [BADGE_TYPES.WEIGHT_125]: {
    name: 'Poids 125kg',
    icon: '🏋️',
    description: 'Poids max 125kg',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  [BADGE_TYPES.WEIGHT_150]: {
    name: 'Poids 150kg',
    icon: '🏋️',
    description: 'Poids max 150kg',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  [BADGE_TYPES.WEIGHT_200]: {
    name: 'Poids 200kg',
    icon: '🏋️',
    description: 'Poids max 200kg',
    color: 'bg-red-100 text-red-800 border-red-200'
  },
  [BADGE_TYPES.WEIGHT_250]: {
    name: 'Poids 250kg',
    icon: '🏋️',
    description: 'Poids max 250kg',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  
  // Badges de séances
  [BADGE_TYPES.WORKOUTS_10]: {
    name: '10 séances',
    icon: '💪',
    description: '10 séances complétées',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  [BADGE_TYPES.WORKOUTS_25]: {
    name: '25 séances',
    icon: '💪💪',
    description: '25 séances complétées',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  [BADGE_TYPES.WORKOUTS_50]: {
    name: '50 séances',
    icon: '💪💪💪',
    description: '50 séances complétées',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  [BADGE_TYPES.WORKOUTS_100]: {
    name: '100 séances',
    icon: '💪💪💪💪',
    description: '100 séances complétées',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  [BADGE_TYPES.WORKOUTS_250]: {
    name: '250 séances',
    icon: '💪💪💪💪💪',
    description: '250 séances complétées',
    color: 'bg-red-100 text-red-800 border-red-200'
  },
  [BADGE_TYPES.WORKOUTS_500]: {
    name: '500 séances',
    icon: '💪💪💪💪💪💪',
    description: '500 séances complétées',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  
  // Badges de régularité
  [BADGE_TYPES.WEEKLY_3]: {
    name: '3 par semaine',
    icon: '📅',
    description: '3 séances en 1 semaine',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  [BADGE_TYPES.WEEKLY_5]: {
    name: '5 par semaine',
    icon: '📅',
    description: '5 séances en 1 semaine',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  [BADGE_TYPES.WEEKLY_7]: {
    name: '7 par semaine',
    icon: '📅',
    description: '7 séances en 1 semaine',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  [BADGE_TYPES.MONTHLY_10]: {
    name: '10 par mois',
    icon: '📅',
    description: '10 séances en 1 mois',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  [BADGE_TYPES.MONTHLY_20]: {
    name: '20 par mois',
    icon: '📅',
    description: '20 séances en 1 mois',
    color: 'bg-red-100 text-red-800 border-red-200'
  },
  [BADGE_TYPES.MONTHLY_30]: {
    name: '30 par mois',
    icon: '📅',
    description: '30 séances en 1 mois',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  
  // Badges de défis
  [BADGE_TYPES.CHALLENGE_5]: {
    name: '5 défis',
    icon: '🏆',
    description: '5 défis gagnés',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  [BADGE_TYPES.CHALLENGE_10]: {
    name: '10 défis',
    icon: '🏆🏆',
    description: '10 défis gagnés',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  [BADGE_TYPES.CHALLENGE_25]: {
    name: '25 défis',
    icon: '🏆🏆🏆',
    description: '25 défis gagnés',
    color: 'bg-red-100 text-red-800 border-red-200'
  },
  [BADGE_TYPES.CHALLENGE_50]: {
    name: '50 défis',
    icon: '🏆🏆🏆🏆',
    description: '50 défis gagnés',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  
  // Badges d'exercices spécifiques
  [BADGE_TYPES.BENCH_MASTER]: {
    name: 'Maître du bench',
    icon: '🛏️',
    description: 'Expert en développé couché',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  [BADGE_TYPES.SQUAT_MASTER]: {
    name: 'Maître du squat',
    icon: '🦵',
    description: 'Expert en squat',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  [BADGE_TYPES.DEADLIFT_MASTER]: {
    name: 'Maître du deadlift',
    icon: '🏋️',
    description: 'Expert en soulevé de terre',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  [BADGE_TYPES.PULLUP_MASTER]: {
    name: 'Maître des tractions',
    icon: '💪',
    description: 'Expert en tractions',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  [BADGE_TYPES.PUSHUP_MASTER]: {
    name: 'Maître des pompes',
    icon: '🤸',
    description: 'Expert en pompes',
    color: 'bg-red-100 text-red-800 border-red-200'
  },
  
  // Badges de temps
  [BADGE_TYPES.EARLY_BIRD]: {
    name: 'Lève-tôt',
    icon: '🌅',
    description: 'Séances avant 8h',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  [BADGE_TYPES.NIGHT_OWL]: {
    name: 'Oiseau de nuit',
    icon: '🦉',
    description: 'Séances après 22h',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  [BADGE_TYPES.WEEKEND_WARRIOR]: {
    name: 'Guerrier du weekend',
    icon: '🏃',
    description: 'Séances le weekend',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  [BADGE_TYPES.DAILY_GRIND]: {
    name: 'Routine quotidienne',
    icon: '⚡',
    description: 'Séances quotidiennes',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  
  // Badges de performance
  [BADGE_TYPES.SPEED_DEMON]: {
    name: 'Démon de vitesse',
    icon: '⚡',
    description: 'Séances rapides',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  [BADGE_TYPES.ENDURANCE_KING]: {
    name: 'Roi de l\'endurance',
    icon: '🏃',
    description: 'Séances longues',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  [BADGE_TYPES.STRENGTH_LEGEND]: {
    name: 'Légende de la force',
    icon: '💪',
    description: 'Force maximale',
    color: 'bg-red-100 text-red-800 border-red-200'
  },
  [BADGE_TYPES.FLEXIBILITY_MASTER]: {
    name: 'Maître de la flexibilité',
    icon: '🧘',
    description: 'Flexibilité',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  
  // Badges de motivation
  [BADGE_TYPES.MOTIVATION_MASTER]: {
    name: 'Maître de la motivation',
    icon: '💯',
    description: 'Motivation constante',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  [BADGE_TYPES.COMEBACK_KID]: {
    name: 'Retour en force',
    icon: '🔄',
    description: 'Retour après pause',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  [BADGE_TYPES.CONSISTENCY_KING]: {
    name: 'Roi de la régularité',
    icon: '👑',
    description: 'Régularité parfaite',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  [BADGE_TYPES.PROGRESS_MAKER]: {
    name: 'Faiseur de progrès',
    icon: '📈',
    description: 'Progrès constants',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  
  // Badges spéciaux
  [BADGE_TYPES.GOLDEN_MEMBER]: {
    name: 'Membre d\'or',
    icon: '🥇',
    description: 'Membre premium',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  [BADGE_TYPES.SILVER_MEMBER]: {
    name: 'Membre d\'argent',
    icon: '🥈',
    description: 'Membre avancé',
    color: 'bg-gray-100 text-gray-800 border-gray-200'
  },
  [BADGE_TYPES.BRONZE_MEMBER]: {
    name: 'Membre de bronze',
    icon: '🥉',
    description: 'Membre régulier',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  [BADGE_TYPES.PLATINUM_MEMBER]: {
    name: 'Membre platine',
    icon: '💎',
    description: 'Membre VIP',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  
  // Badges de saison
  [BADGE_TYPES.SPRING_TRAINER]: {
    name: 'Entraîneur du printemps',
    icon: '🌸',
    description: 'Séances au printemps',
    color: 'bg-pink-100 text-pink-800 border-pink-200'
  },
  [BADGE_TYPES.SUMMER_WARRIOR]: {
    name: 'Guerrier de l\'été',
    icon: '☀️',
    description: 'Séances en été',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  [BADGE_TYPES.AUTUMN_STRENGTH]: {
    name: 'Force de l\'automne',
    icon: '🍂',
    description: 'Séances en automne',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  [BADGE_TYPES.WINTER_CHAMPION]: {
    name: 'Champion de l\'hiver',
    icon: '❄️',
    description: 'Séances en hiver',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  
  // Badges de records
  [BADGE_TYPES.PERSONAL_BEST]: {
    name: 'Record personnel',
    icon: '🏅',
    description: 'Nouveau record',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  [BADGE_TYPES.WORLD_RECORD]: {
    name: 'Record du monde',
    icon: '🌍',
    description: 'Record mondial',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  [BADGE_TYPES.TEAM_PLAYER]: {
    name: 'Joueur d\'équipe',
    icon: '👥',
    description: 'Travail en équipe',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  [BADGE_TYPES.SOLO_CHAMPION]: {
    name: 'Champion solo',
    icon: '🦁',
    description: 'Performance solo',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  
  // Badges de variété
  [BADGE_TYPES.EXERCISE_EXPLORER]: {
    name: 'Explorateur d\'exercices',
    icon: '🔍',
    description: 'Exercices variés',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  [BADGE_TYPES.ROUTINE_MASTER]: {
    name: 'Maître de routine',
    icon: '📋',
    description: 'Routines parfaites',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  [BADGE_TYPES.VARIETY_KING]: {
    name: 'Roi de la variété',
    icon: '🎲',
    description: 'Variété maximale',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  [BADGE_TYPES.SPECIALIST]: {
    name: 'Spécialiste',
    icon: '🎯',
    description: 'Expert dans un domaine',
    color: 'bg-red-100 text-red-800 border-red-200'
  },
  
  // Badges d'anime japonais
  [BADGE_TYPES.NARUTO_RUNNER]: {
    name: 'Coureur Naruto',
    icon: '🏃‍♂️',
    description: 'Course rapide comme Naruto',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  [BADGE_TYPES.DRAGON_BALL_WARRIOR]: {
    name: 'Guerrier Dragon Ball',
    icon: '🐉',
    description: 'Force surhumaine atteinte',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  [BADGE_TYPES.ONE_PIECE_NAVIGATOR]: {
    name: 'Navigateur One Piece',
    icon: '🧭',
    description: 'Navigation parfaite dans les défis',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  [BADGE_TYPES.ATTACK_ON_TITAN_SOLDIER]: {
    name: 'Soldat Attack on Titan',
    icon: '⚔️',
    description: 'Courage face aux défis difficiles',
    color: 'bg-gray-100 text-gray-800 border-gray-200'
  },
  [BADGE_TYPES.DEMON_SLAYER_HASHIRA]: {
    name: 'Hashira Demon Slayer',
    icon: '🗡️',
    description: 'Maître des techniques avancées',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  [BADGE_TYPES.MY_HERO_ACADEMIA_HERO]: {
    name: 'Héros My Hero Academia',
    icon: '🦸‍♂️',
    description: 'Héros en devenir',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  [BADGE_TYPES.POKEMON_TRAINER]: {
    name: 'Dresseur Pokémon',
    icon: '⚡',
    description: 'Collectionneur de badges',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  [BADGE_TYPES.SAILOR_MOON_GUARDIAN]: {
    name: 'Gardienne Sailor Moon',
    icon: '🌙',
    description: 'Protectrice de la motivation',
    color: 'bg-pink-100 text-pink-800 border-pink-200'
  },
  [BADGE_TYPES.BLEACH_SOUL_REAPER]: {
    name: 'Shinigami Bleach',
    icon: '⚰️',
    description: 'Maître de la discipline',
    color: 'bg-black-100 text-black-800 border-black-200'
  },
  [BADGE_TYPES.FULLMETAL_ALCHEMIST]: {
    name: 'Alchimiste Fullmetal',
    icon: '⚗️',
    description: 'Transmutation parfaite',
    color: 'bg-red-100 text-red-800 border-red-200'
  },
  [BADGE_TYPES.DEATH_NOTE_DETECTIVE]: {
    name: 'Détective Death Note',
    icon: '📓',
    description: 'Stratégie et planification',
    color: 'bg-gray-100 text-gray-800 border-gray-200'
  },
  [BADGE_TYPES.TOKYO_GHOUL_INVESTIGATOR]: {
    name: 'Enquêteur Tokyo Ghoul',
    icon: '👁️',
    description: 'Perception aiguisée',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  [BADGE_TYPES.HUNTER_X_HUNTER_HUNTER]: {
    name: 'Hunter Hunter x Hunter',
    icon: '🎯',
    description: 'Chasseur d\'objectifs',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  [BADGE_TYPES.FAIRY_TAIL_MAGE]: {
    name: 'Mage Fairy Tail',
    icon: '🧙‍♂️',
    description: 'Magie de l\'amitié',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  [BADGE_TYPES.SWORD_ART_ONLINE_PLAYER]: {
    name: 'Joueur Sword Art Online',
    icon: '⚔️',
    description: 'Maître du virtuel',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  [BADGE_TYPES.JOJO_BIZARRE_ADVENTURE]: {
    name: 'Aventurier JoJo',
    icon: '💪',
    description: 'Style et pose parfaits',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  [BADGE_TYPES.EVANGELION_PILOT]: {
    name: 'Pilote Evangelion',
    icon: '🤖',
    description: 'Synchronisation parfaite',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  [BADGE_TYPES.GHOST_IN_THE_SHELL]: {
    name: 'Ghost in the Shell',
    icon: '🤖',
    description: 'Conscience augmentée',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200'
  },
  [BADGE_TYPES.AKIRA_PSYCHIC]: {
    name: 'Psychique Akira',
    icon: '🧠',
    description: 'Pouvoirs psychiques',
    color: 'bg-pink-100 text-pink-800 border-pink-200'
  },
  [BADGE_TYPES.COWBOY_BEBOP_BOUNTY]: {
    name: 'Chasseur de Primes Cowboy Bebop',
    icon: '🌙',
    description: 'Chasseur de records',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  }
};

// Composant pour afficher un badge individuel
function Badge({ type, size = 'sm' }) {
  const config = BADGE_CONFIG[type];
  if (!config) return null;

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${config.color} border-2 rounded-full flex items-center justify-center font-bold`}
      title={`${config.name}: ${config.description}`}
    >
      {config.icon}
    </div>
  );
}

// Composant pour afficher une liste de badges
function BadgeList({ badges = [], size = 'sm', maxDisplay = 3 }) {
  if (!badges || badges.length === 0) return null;

  const displayedBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  return (
    <div className="flex items-center space-x-1">
      {displayedBadges.map((badge, index) => (
        <Badge key={index} type={badge} size={size} />
      ))}
      {remainingCount > 0 && (
        <div className={`${size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'} bg-gray-100 text-gray-600 border-2 border-gray-200 rounded-full flex items-center justify-center text-xs font-bold`}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

// Composant pour afficher les badges dans un tooltip détaillé
function BadgeTooltip({ badges = [] }) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
      <h4 className="font-semibold text-gray-800 mb-2">Badges obtenus</h4>
      <div className="space-y-2">
        {badges.map((badge, index) => {
          const config = BADGE_CONFIG[badge];
          if (!config) return null;
          
          return (
            <div key={index} className="flex items-center space-x-2">
              <div className={`w-6 h-6 ${config.color} border rounded-full flex items-center justify-center text-xs`}>
                {config.icon}
              </div>
              <div>
                <div className="font-medium text-sm text-gray-800">{config.name}</div>
                <div className="text-xs text-gray-600">{config.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { Badge, BadgeList, BadgeTooltip };
export default BadgeList; 