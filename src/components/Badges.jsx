import React from 'react';

// Types de badges disponibles
export const BADGE_TYPES = {
  WORKOUT_STREAK: 'workout_streak',
  WEIGHT_MASTER: 'weight_master',
  CONSISTENCY: 'consistency',
  CHALLENGE_WINNER: 'challenge_winner',
  FIRST_WORKOUT: 'first_workout',
  WEEKLY_GOAL: 'weekly_goal',
  MONTHLY_GOAL: 'monthly_goal'
};

// Configuration des badges
export const BADGE_CONFIG = {
  [BADGE_TYPES.WORKOUT_STREAK]: {
    name: 'Série d\'entraînement',
    icon: '🔥',
    description: '3 séances consécutives',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  [BADGE_TYPES.WEIGHT_MASTER]: {
    name: 'Maître du poids',
    icon: '💪',
    description: 'Poids max > 100kg',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  [BADGE_TYPES.CONSISTENCY]: {
    name: 'Régularité',
    icon: '📅',
    description: '5 séances en 1 semaine',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  [BADGE_TYPES.CHALLENGE_WINNER]: {
    name: 'Vainqueur de défi',
    icon: '🏆',
    description: 'A gagné un défi',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  [BADGE_TYPES.FIRST_WORKOUT]: {
    name: 'Première séance',
    icon: '🎯',
    description: 'Première séance complétée',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
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