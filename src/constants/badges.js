// Types de badges disponibles
export const BADGE_TYPES = {
  FIRST_WORKOUT: 'first_workout',
  WORKOUT_STREAK: 'workout_streak',
  CONSISTENCY: 'consistency',
  WEIGHT_MASTER: 'weight_master',
  CHALLENGE_WINNER: 'challenge_winner',
  WEEKLY_GOAL: 'weekly_goal',
  MONTHLY_GOAL: 'monthly_goal',
  STREAK_1: 'streak_1',
  STREAK_3: 'streak_3',
  STREAK_7: 'streak_7',
  STREAK_14: 'streak_14',
  STREAK_21: 'streak_21',
  STREAK_30: 'streak_30',
  STREAK_50: 'streak_50',
  STREAK_100: 'streak_100',
  WEIGHT_50: 'weight_50',
  WEIGHT_75: 'weight_75',
  WEIGHT_100: 'weight_100',
  WEIGHT_125: 'weight_125',
  WEIGHT_150: 'weight_150',
  WEIGHT_200: 'weight_200',
  WEIGHT_250: 'weight_250',
  WORKOUTS_10: 'workouts_10',
  WORKOUTS_25: 'workouts_25',
  WORKOUTS_50: 'workouts_50',
  WORKOUTS_100: 'workouts_100',
  WORKOUTS_250: 'workouts_250',
  WORKOUTS_500: 'workouts_500',
  WEEKLY_3: 'weekly_3',
  WEEKLY_5: 'weekly_5',
  WEEKLY_7: 'weekly_7',
  MONTHLY_10: 'monthly_10',
  MONTHLY_20: 'monthly_20',
  MONTHLY_30: 'monthly_30',
  CHALLENGE_5: 'challenge_5',
  CHALLENGE_10: 'challenge_10',
  CHALLENGE_25: 'challenge_25',
  CHALLENGE_50: 'challenge_50',
  BENCH_MASTER: 'bench_master',
  SQUAT_MASTER: 'squat_master',
  DEADLIFT_MASTER: 'deadlift_master',
  PULLUP_MASTER: 'pullup_master',
  PUSHUP_MASTER: 'pushup_master',
  EARLY_BIRD: 'early_bird',
  NIGHT_OWL: 'night_owl',
  WEEKEND_WARRIOR: 'weekend_warrior',
  DAILY_GRIND: 'daily_grind',
  SPEED_DEMON: 'speed_demon',
  ENDURANCE_KING: 'endurance_king',
  STRENGTH_LEGEND: 'strength_legend',
  FLEXIBILITY_MASTER: 'flexibility_master',
  MOTIVATION_MASTER: 'motivation_master',
  COMEBACK_KID: 'comeback_kid',
  CONSISTENCY_KING: 'consistency_king',
  PROGRESS_MAKER: 'progress_maker',
  GOLDEN_MEMBER: 'golden_member',
  SILVER_MEMBER: 'silver_member',
  BRONZE_MEMBER: 'bronze_member',
  PLATINUM_MEMBER: 'platinum_member',
  SPRING_TRAINER: 'spring_trainer',
  SUMMER_WARRIOR: 'summer_warrior',
  AUTUMN_STRENGTH: 'autumn_strength',
  WINTER_CHAMPION: 'winter_champion',
  PERSONAL_BEST: 'personal_best',
  WORLD_RECORD: 'world_record',
  TEAM_PLAYER: 'team_player',
  SOLO_CHAMPION: 'solo_champion',
  EXERCISE_EXPLORER: 'exercise_explorer',
  ROUTINE_MASTER: 'routine_master',
  VARIETY_KING: 'variety_king',
  SPECIALIST: 'specialist',
  
  // Badges d'anime japonais
  NARUTO_RUNNER: 'naruto_runner',
  DRAGON_BALL_WARRIOR: 'dragon_ball_warrior',
  ONE_PIECE_NAVIGATOR: 'one_piece_navigator',
  ATTACK_ON_TITAN_SOLDIER: 'attack_on_titan_soldier',
  DEMON_SLAYER_HASHIRA: 'demon_slayer_hashira',
  MY_HERO_ACADEMIA_HERO: 'my_hero_academia_hero',
  POKEMON_TRAINER: 'pokemon_trainer',
  SAILOR_MOON_GUARDIAN: 'sailor_moon_guardian',
  BLEACH_SOUL_REAPER: 'bleach_soul_reaper',
  FULLMETAL_ALCHEMIST: 'fullmetal_alchemist',
  DEATH_NOTE_DETECTIVE: 'death_note_detective',
  TOKYO_GHOUL_INVESTIGATOR: 'tokyo_ghoul_investigator',
  HUNTER_X_HUNTER_HUNTER: 'hunter_x_hunter_hunter',
  FAIRY_TAIL_MAGE: 'fairy_tail_mage',
  SWORD_ART_ONLINE_PLAYER: 'sword_art_online_player',
  JOJO_BIZARRE_ADVENTURE: 'jojo_bizarre_adventure',
  EVANGELION_PILOT: 'evangelion_pilot',
  GHOST_IN_THE_SHELL: 'ghost_in_the_shell',
  AKIRA_PSYCHIC: 'akira_psychic',
  COWBOY_BEBOP_BOUNTY: 'cowboy_bebop_bounty'
};

// Catégories de badges
export const BADGE_CATEGORIES = {
  BEGINNER: {
    id: 'beginner',
    name: 'Débutant',
    icon: '🌱',
    color: 'bg-green-100 text-green-800 border-green-200',
    badges: [
      BADGE_TYPES.FIRST_WORKOUT,
      BADGE_TYPES.WORKOUT_STREAK,
      BADGE_TYPES.CONSISTENCY,
      BADGE_TYPES.STREAK_5,
      BADGE_TYPES.WORKOUTS_10,
      BADGE_TYPES.WEEKLY_3,
      BADGE_TYPES.BRONZE_MEMBER
    ]
  },
  PROGRESS: {
    id: 'progress',
    name: 'Progression',
    icon: '📈',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    badges: [
      BADGE_TYPES.STREAK_10,
      BADGE_TYPES.STREAK_20,
      BADGE_TYPES.WORKOUTS_25,
      BADGE_TYPES.WORKOUTS_50,
      BADGE_TYPES.WEEKLY_5,
      BADGE_TYPES.MONTHLY_10,
      BADGE_TYPES.WEIGHT_50,
      BADGE_TYPES.WEIGHT_75,
      BADGE_TYPES.SILVER_MEMBER,
      BADGE_TYPES.PROGRESS_MAKER
    ]
  },
  STRENGTH: {
    id: 'strength',
    name: 'Force',
    icon: '💪',
    color: 'bg-red-100 text-red-800 border-red-200',
    badges: [
      BADGE_TYPES.WEIGHT_100,
      BADGE_TYPES.WEIGHT_125,
      BADGE_TYPES.WEIGHT_150,
      BADGE_TYPES.WEIGHT_200,
      BADGE_TYPES.WEIGHT_250,
      BADGE_TYPES.WEIGHT_MASTER,
      BADGE_TYPES.BENCH_MASTER,
      BADGE_TYPES.SQUAT_MASTER,
      BADGE_TYPES.DEADLIFT_MASTER,
      BADGE_TYPES.PULLUP_MASTER,
      BADGE_TYPES.PUSHUP_MASTER,
      BADGE_TYPES.STRENGTH_LEGEND,
      BADGE_TYPES.DRAGON_BALL_WARRIOR,
      BADGE_TYPES.JOJO_BIZARRE_ADVENTURE,
      BADGE_TYPES.FULLMETAL_ALCHEMIST,
      BADGE_TYPES.AKIRA_PSYCHIC
    ]
  },
  ENDURANCE: {
    id: 'endurance',
    name: 'Endurance',
    icon: '🏃',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    badges: [
      BADGE_TYPES.STREAK_30,
      BADGE_TYPES.STREAK_50,
      BADGE_TYPES.STREAK_100,
      BADGE_TYPES.WORKOUTS_100,
      BADGE_TYPES.WORKOUTS_250,
      BADGE_TYPES.WORKOUTS_500,
      BADGE_TYPES.WEEKLY_7,
      BADGE_TYPES.MONTHLY_20,
      BADGE_TYPES.MONTHLY_30,
      BADGE_TYPES.ENDURANCE_KING,
      BADGE_TYPES.SPEED_DEMON,
      BADGE_TYPES.NARUTO_RUNNER,
      BADGE_TYPES.EVANGELION_PILOT
    ]
  },
  CHALLENGES: {
    id: 'challenges',
    name: 'Défis',
    icon: '🏆',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    badges: [
      BADGE_TYPES.CHALLENGE_WINNER,
      BADGE_TYPES.CHALLENGE_5,
      BADGE_TYPES.CHALLENGE_10,
      BADGE_TYPES.CHALLENGE_25,
      BADGE_TYPES.CHALLENGE_50,
      BADGE_TYPES.ONE_PIECE_NAVIGATOR,
      BADGE_TYPES.ATTACK_ON_TITAN_SOLDIER,
      BADGE_TYPES.FAIRY_TAIL_MAGE,
      BADGE_TYPES.DEATH_NOTE_DETECTIVE
    ]
  },
  LIFESTYLE: {
    id: 'lifestyle',
    name: 'Mode de vie',
    icon: '🌅',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    badges: [
      BADGE_TYPES.EARLY_BIRD,
      BADGE_TYPES.NIGHT_OWL,
      BADGE_TYPES.WEEKEND_WARRIOR,
      BADGE_TYPES.DAILY_GRIND,
      BADGE_TYPES.SPRING_TRAINER,
      BADGE_TYPES.SUMMER_WARRIOR,
      BADGE_TYPES.AUTUMN_STRENGTH,
      BADGE_TYPES.WINTER_CHAMPION,
      BADGE_TYPES.COWBOY_BEBOP_BOUNTY
    ]
  },
  MOTIVATION: {
    id: 'motivation',
    name: 'Motivation',
    icon: '💯',
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    badges: [
      BADGE_TYPES.MOTIVATION_MASTER,
      BADGE_TYPES.CONSISTENCY_KING,
      BADGE_TYPES.COMEBACK_KID,
      BADGE_TYPES.GOLDEN_MEMBER,
      BADGE_TYPES.PLATINUM_MEMBER,
      BADGE_TYPES.SAILOR_MOON_GUARDIAN,
      BADGE_TYPES.BLEACH_SOUL_REAPER
    ]
  },
  SKILLS: {
    id: 'skills',
    name: 'Compétences',
    icon: '🎯',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    badges: [
      BADGE_TYPES.FLEXIBILITY_MASTER,
      BADGE_TYPES.EXERCISE_EXPLORER,
      BADGE_TYPES.ROUTINE_MASTER,
      BADGE_TYPES.VARIETY_KING,
      BADGE_TYPES.SPECIALIST,
      BADGE_TYPES.DEMON_SLAYER_HASHIRA,
      BADGE_TYPES.TOKYO_GHOUL_INVESTIGATOR,
      BADGE_TYPES.HUNTER_X_HUNTER_HUNTER,
      BADGE_TYPES.SWORD_ART_ONLINE_PLAYER,
      BADGE_TYPES.GHOST_IN_THE_SHELL
    ]
  },
  ANIME: {
    id: 'anime',
    name: 'Anime',
    icon: '🎌',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    badges: [
      BADGE_TYPES.NARUTO_RUNNER,
      BADGE_TYPES.DRAGON_BALL_WARRIOR,
      BADGE_TYPES.ONE_PIECE_NAVIGATOR,
      BADGE_TYPES.ATTACK_ON_TITAN_SOLDIER,
      BADGE_TYPES.DEMON_SLAYER_HASHIRA,
      BADGE_TYPES.MY_HERO_ACADEMIA_HERO,
      BADGE_TYPES.POKEMON_TRAINER,
      BADGE_TYPES.SAILOR_MOON_GUARDIAN,
      BADGE_TYPES.BLEACH_SOUL_REAPER,
      BADGE_TYPES.FULLMETAL_ALCHEMIST,
      BADGE_TYPES.DEATH_NOTE_DETECTIVE,
      BADGE_TYPES.TOKYO_GHOUL_INVESTIGATOR,
      BADGE_TYPES.HUNTER_X_HUNTER_HUNTER,
      BADGE_TYPES.FAIRY_TAIL_MAGE,
      BADGE_TYPES.SWORD_ART_ONLINE_PLAYER,
      BADGE_TYPES.JOJO_BIZARRE_ADVENTURE,
      BADGE_TYPES.EVANGELION_PILOT,
      BADGE_TYPES.GHOST_IN_THE_SHELL,
      BADGE_TYPES.AKIRA_PSYCHIC,
      BADGE_TYPES.COWBOY_BEBOP_BOUNTY
    ]
  },
  RECORDS: {
    id: 'records',
    name: 'Records',
    icon: '🏅',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    badges: [
      BADGE_TYPES.PERSONAL_BEST,
      BADGE_TYPES.WORLD_RECORD,
      BADGE_TYPES.TEAM_PLAYER,
      BADGE_TYPES.SOLO_CHAMPION,
      BADGE_TYPES.WEEKLY_GOAL,
      BADGE_TYPES.MONTHLY_GOAL
    ]
  }
}; 