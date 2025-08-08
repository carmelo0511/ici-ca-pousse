/**
 * Contraintes spécifiques à la musculation pour des prédictions réalistes
 * Respecte les règles physiques et métier de l'entraînement en force
 */

// Contraintes de progression réalistes en musculation
export const MUSCULATION_CONSTRAINTS = {
  // Progression minimale par session (pas de 0.3kg impossible)
  MIN_INCREMENT: 0.5, // kg minimum
  
  // Progression maximale réaliste par session
  MAX_INCREMENT: 2.5, // kg maximum
  
  // Paliers de poids standards (disques disponibles en salle)
  PLATE_INCREMENTS: [0.5, 1, 1.25, 2.5, 5, 10, 15, 20], // kg
  
  // Progression selon le niveau d'expérience
  PROGRESSION_RATES: {
    beginner: { 
      min: 1.0, 
      max: 2.5, 
      frequency: 'weekly',
      description: 'Progression rapide possible' 
    },
    intermediate: { 
      min: 0.5, 
      max: 1.5, 
      frequency: 'biweekly',
      description: 'Progression modérée et constante'
    },
    advanced: { 
      min: 0.5, 
      max: 1.0, 
      frequency: 'monthly',
      description: 'Progression lente mais précise'
    }
  },
  
  // Types d'exercices et leur spécificité de progression
  EXERCISE_TYPES: {
    compound: { 
      progression_rate: 1.0, 
      recovery_time: 48, // heures
      description: 'Exercices polyarticulaires (squat, bench, deadlift)'
    },
    isolation: { 
      progression_rate: 0.5, 
      recovery_time: 24, // heures
      description: 'Exercices d\'isolation (curl, extension, etc.)'
    }
  },
  
  // Détection de plateau de force
  PLATEAU_THRESHOLD: 4, // semaines sans progression
  PLATEAU_DETECTION_WINDOW: 6, // semaines d'analyse
  
  // Limites de sécurité
  SAFETY_LIMITS: {
    MAX_WEEKLY_INCREMENT: 5.0, // kg maximum par semaine
    MAX_SESSION_VOLUME: 50, // nombre de séries maximum
    MIN_REST_BETWEEN_SESSIONS: 24 // heures minimum
  },
  
  // Classification des groupes musculaires
  MUSCLE_GROUPS: {
    'chest': { type: 'compound', recovery: 48 },
    'back': { type: 'compound', recovery: 48 },
    'legs': { type: 'compound', recovery: 72 },
    'shoulders': { type: 'compound', recovery: 36 },
    'arms': { type: 'isolation', recovery: 24 },
    'core': { type: 'isolation', recovery: 24 }
  }
};

/**
 * Valide une prédiction selon les contraintes de musculation réalistes
 * @param {number} prediction - Prédiction brute du modèle
 * @param {number} currentWeight - Poids actuel
 * @param {string} userLevel - Niveau de l'utilisateur (beginner/intermediate/advanced)
 * @param {string} exerciseType - Type d'exercice (compound/isolation)
 * @returns {Object} Prédiction validée avec explications
 */
export const validateMusculationPrediction = (prediction, currentWeight, userLevel = 'intermediate', exerciseType = 'compound') => {
  const constraints = MUSCULATION_CONSTRAINTS.PROGRESSION_RATES[userLevel];
  const increment = prediction - currentWeight;
  
  let validatedWeight = prediction;
  let appliedConstraints = [];
  let recommendations = [];
  
  // Vérifier les limites réalistes selon le niveau
  if (increment < constraints.min) {
    validatedWeight = currentWeight + constraints.min;
    appliedConstraints.push(`Augmentation minimale appliquée: ${constraints.min}kg`);
    recommendations.push(`🔥 Progression minimale pour votre niveau ${userLevel}`);
  }
  
  if (increment > constraints.max) {
    validatedWeight = currentWeight + constraints.max;
    appliedConstraints.push(`Augmentation maximale appliquée: ${constraints.max}kg`);
    recommendations.push(`⚠️ Progression limitée pour éviter les blessures`);
  }
  
  // Ajustement selon le type d'exercice
  const exerciseConstraint = MUSCULATION_CONSTRAINTS.EXERCISE_TYPES[exerciseType];
  if (exerciseConstraint) {
    const adjustedIncrement = (validatedWeight - currentWeight) * exerciseConstraint.progression_rate;
    validatedWeight = currentWeight + adjustedIncrement;
    
    if (exerciseType === 'isolation') {
      recommendations.push(`🎯 Exercice d'isolation: progression plus prudente`);
    } else {
      recommendations.push(`💪 Exercice composé: progression plus agressive possible`);
    }
  }
  
  // Arrondir au palier de poids le plus proche
  const roundedWeight = roundToNearestPlate(validatedWeight, currentWeight);
  
  if (roundedWeight !== validatedWeight) {
    appliedConstraints.push(`Arrondi au palier de poids: ${roundedWeight}kg`);
  }
  
  return {
    originalPrediction: prediction,
    validatedWeight: roundedWeight,
    increment: roundedWeight - currentWeight,
    appliedConstraints,
    recommendations,
    userLevel,
    exerciseType,
    confidence: calculatePredictionConfidence(increment, constraints),
    plateIncrement: getUsedPlateIncrement(roundedWeight, currentWeight)
  };
};

/**
 * Arrondit une prédiction au palier de poids le plus proche disponible
 * @param {number} prediction - Poids prédit
 * @param {number} currentWeight - Poids actuel
 * @returns {number} Poids arrondi au palier disponible
 */
export const roundToNearestPlate = (prediction, currentWeight) => {
  const increment = prediction - currentWeight;
  const plates = MUSCULATION_CONSTRAINTS.PLATE_INCREMENTS;
  
  // Si l'incrément est négatif, maintenir le poids actuel
  if (increment <= 0) {
    return currentWeight;
  }
  
  // Trouver le palier le plus proche
  const nearestPlate = plates.reduce((prev, curr) => 
    Math.abs(curr - increment) < Math.abs(prev - increment) ? curr : prev
  );
  
  return currentWeight + nearestPlate;
};

/**
 * Calcule la confiance d'une prédiction basée sur les contraintes
 * @param {number} increment - Incrément prédit
 * @param {Object} constraints - Contraintes du niveau utilisateur
 * @returns {number} Confiance entre 0 et 100
 */
export const calculatePredictionConfidence = (increment, constraints) => {
  const { min, max } = constraints;
  
  // Confiance maximale si dans la plage idéale
  if (increment >= min && increment <= max) {
    return 95;
  }
  
  // Confiance réduite si en dehors des limites
  if (increment < min) {
    return Math.max(60, 95 - (min - increment) * 20);
  }
  
  if (increment > max) {
    return Math.max(70, 95 - (increment - max) * 15);
  }
  
  return 75;
};

/**
 * Retourne le palier de poids utilisé pour l'ajustement
 * @param {number} finalWeight - Poids final
 * @param {number} currentWeight - Poids actuel
 * @returns {number} Palier utilisé
 */
export const getUsedPlateIncrement = (finalWeight, currentWeight) => {
  return finalWeight - currentWeight;
};

/**
 * Détecte un plateau de force dans l'historique d'entraînement
 * @param {Array} exerciseHistory - Historique de l'exercice
 * @param {number} weeks - Nombre de semaines à analyser
 * @returns {Object} Résultats de la détection de plateau
 */
export const detectStrengthPlateau = (exerciseHistory, weeks = 6) => {
  if (!exerciseHistory || exerciseHistory.length < 3) {
    return { isPlateau: false, message: 'Pas assez de données pour détecter un plateau' };
  }
  
  // Analyser les dernières semaines
  const recentData = exerciseHistory.slice(-weeks);
  const weights = recentData.map(d => d.weight || d.maxWeight || 0);
  const maxWeight = Math.max(...weights);
  const plateauThreshold = MUSCULATION_CONSTRAINTS.PLATEAU_THRESHOLD;
  
  // Compter les sessions sans progression
  const sessionsWithoutProgress = recentData.filter(d => {
    const weight = d.weight || d.maxWeight || 0;
    return weight < maxWeight;
  }).length;
  
  // Calculer la stagnation en semaines
  const weeksStuck = Math.floor(sessionsWithoutProgress * 7 / 7); // Approximation
  
  if (weeksStuck >= plateauThreshold) {
    return {
      isPlateau: true,
      weeksStuck,
      maxWeight,
      currentWeight: weights[weights.length - 1],
      recommendations: generatePlateauRecommendations(weeksStuck, maxWeight),
      severity: weeksStuck > 8 ? 'high' : weeksStuck > 6 ? 'medium' : 'low'
    };
  }
  
  return { 
    isPlateau: false, 
    trend: 'progressing',
    recentProgress: weights[weights.length - 1] - weights[0]
  };
};

/**
 * Génère des recommandations pour sortir d'un plateau
 * @param {number} weeksStuck - Nombre de semaines bloqué
 * @param {number} maxWeight - Poids maximum atteint
 * @returns {Array} Liste de recommandations
 */
export const generatePlateauRecommendations = (weeksStuck, maxWeight) => {
  const recommendations = [];
  
  if (weeksStuck >= 4 && weeksStuck < 6) {
    recommendations.push('🔄 Variez l\'angle ou la prise de l\'exercice');
    recommendations.push('📈 Augmentez légèrement le volume (séries/reps)');
    recommendations.push('⏱️ Modifiez les temps de repos (plus courts ou plus longs)');
  } else if (weeksStuck >= 6 && weeksStuck < 8) {
    recommendations.push('📉 Réduisez le poids de 10% et augmentez les répétitions');
    recommendations.push('🔄 Changez temporairement de variante d\'exercice');
    recommendations.push('💪 Travaillez les muscles stabilisateurs');
    recommendations.push('🍎 Vérifiez votre alimentation et récupération');
  } else if (weeksStuck >= 8) {
    recommendations.push('⚡ Période de décharge: réduire l\'intensité de 20% pendant 2 semaines');
    recommendations.push('🔄 Changement complet de programme d\'entraînement');
    recommendations.push('🏃 Ajoutez du travail cardiovasculaire pour la récupération');
    recommendations.push('😴 Optimisez votre sommeil (8h minimum)');
    recommendations.push('🔬 Analysez votre technique avec un coach');
  }
  
  return recommendations;
};

/**
 * Détermine le niveau de l'utilisateur basé sur son historique
 * @param {Array} workouts - Historique des entraînements
 * @returns {string} Niveau estimé (beginner/intermediate/advanced)
 */
export const determineUserLevel = (workouts) => {
  if (!workouts || workouts.length === 0) {
    return 'beginner';
  }
  
  const totalWorkouts = workouts.length;
  const monthsTraining = totalWorkouts / 4; // Approximation
  
  // Analyser la progression des poids
  const progressionRate = calculateAverageProgression(workouts);
  
  if (monthsTraining < 6 || progressionRate > 1.5) {
    return 'beginner';
  } else if (monthsTraining < 24 || progressionRate > 0.5) {
    return 'intermediate';
  } else {
    return 'advanced';
  }
};

/**
 * Calcule la progression moyenne des poids
 * @param {Array} workouts - Historique des entraînements
 * @returns {number} Progression moyenne en kg par séance
 */
export const calculateAverageProgression = (workouts) => {
  if (!workouts || workouts.length < 2) return 0;
  
  const firstWorkout = workouts[0];
  const lastWorkout = workouts[workouts.length - 1];
  const sessionCount = workouts.length;
  
  // Calculer la progression totale pour tous les exercices
  let totalProgression = 0;
  let exerciseCount = 0;
  
  if (firstWorkout.exercises && lastWorkout.exercises) {
    firstWorkout.exercises.forEach(firstEx => {
      const lastEx = lastWorkout.exercises.find(ex => ex.name === firstEx.name);
      if (lastEx && firstEx.weight && lastEx.weight) {
        totalProgression += (lastEx.weight - firstEx.weight);
        exerciseCount++;
      }
    });
  }
  
  return exerciseCount > 0 ? totalProgression / (sessionCount * exerciseCount) : 0;
};

/**
 * Valide la sécurité d'une prédiction
 * @param {number} predictedWeight - Poids prédit
 * @param {number} currentWeight - Poids actuel
 * @param {Array} recentHistory - Historique récent
 * @returns {Object} Validation de sécurité
 */
export const validateSafety = (predictedWeight, currentWeight, recentHistory = []) => {
  const increment = predictedWeight - currentWeight;
  const warnings = [];
  const safetyScore = 100;
  
  // Vérifier l'incrément maximum par session
  if (increment > MUSCULATION_CONSTRAINTS.MAX_INCREMENT) {
    warnings.push(`⚠️ Augmentation trop importante: ${increment}kg > ${MUSCULATION_CONSTRAINTS.MAX_INCREMENT}kg max`);
  }
  
  // Vérifier l'incrément hebdomadaire
  if (recentHistory.length > 0) {
    const weeklyProgression = calculateWeeklyProgression(recentHistory);
    if (weeklyProgression + increment > MUSCULATION_CONSTRAINTS.SAFETY_LIMITS.MAX_WEEKLY_INCREMENT) {
      warnings.push('⚠️ Progression hebdomadaire trop rapide, risque de blessure');
    }
  }
  
  return {
    isSafe: warnings.length === 0,
    safetyScore: Math.max(0, safetyScore - warnings.length * 20),
    warnings,
    recommendations: warnings.length > 0 ? ['Progression plus prudente recommandée'] : []
  };
};

/**
 * Calcule la progression hebdomadaire récente
 * @param {Array} recentHistory - Historique récent
 * @returns {number} Progression hebdomadaire en kg
 */
export const calculateWeeklyProgression = (recentHistory) => {
  if (recentHistory.length < 2) return 0;
  
  // Approximation simple basée sur les dernières sessions
  const recent = recentHistory.slice(-7); // 7 derniers points
  if (recent.length < 2) return 0;
  
  const firstWeight = recent[0].weight || 0;
  const lastWeight = recent[recent.length - 1].weight || 0;
  
  return lastWeight - firstWeight;
};