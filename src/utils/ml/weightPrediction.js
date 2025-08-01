/**
 * Système de prédiction de poids ML léger
 * Utilise les données d'entraînement pour prédire le prochain poids recommandé
 */

// Fonction pour calculer la progression moyenne
const calculateAverageProgression = (weights) => {
  if (weights.length < 2) return 0;
  
  const progressions = [];
  for (let i = 1; i < weights.length; i++) {
    progressions.push(weights[i] - weights[i - 1]);
  }
  
  return progressions.reduce((sum, prog) => sum + prog, 0) / progressions.length;
};

// Fonction pour détecter les tendances
const detectTrend = (weights, sessions = 5) => {
  if (weights.length < sessions) return 'stable';
  
  const recentWeights = weights.slice(-sessions);
  const firstHalf = recentWeights.slice(0, Math.floor(sessions / 2));
  const secondHalf = recentWeights.slice(Math.floor(sessions / 2));
  
  const firstAvg = firstHalf.reduce((sum, w) => sum + w, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, w) => sum + w, 0) / secondHalf.length;
  
  const difference = secondAvg - firstAvg;
  
  if (difference > 1) return 'increasing';
  if (difference < -1) return 'decreasing';
  return 'stable';
};

// Fonction pour calculer la fréquence d'entraînement
const calculateTrainingFrequency = (workouts, days = 30) => {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  const recentWorkouts = workouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    return workoutDate >= cutoffDate;
  });
  
  return recentWorkouts.length / (days / 7); // sessions par semaine
};

// Fonction principale de prédiction
export const predictNextWeight = (exerciseName, workouts, currentWeight = null) => {
  try {
    // Extraire les poids pour cet exercice
    const exerciseWeights = [];
    const exerciseDates = [];
    
    workouts.forEach(workout => {
      workout.exercises?.forEach(exercise => {
        if (exercise.name === exerciseName && exercise.sets) {
          exercise.sets.forEach(set => {
            if (set.weight && set.weight > 0) {
              exerciseWeights.push(parseFloat(set.weight));
              exerciseDates.push(new Date(workout.date));
            }
          });
        }
      });
    });
    
    if (exerciseWeights.length === 0) {
      return {
        predictedWeight: currentWeight || 0,
        confidence: 0,
        trend: 'no_data',
        recommendation: 'Pas assez de données pour prédire',
        factors: []
      };
    }
    
    // Calculer les métriques
    const lastWeight = exerciseWeights[exerciseWeights.length - 1];
    const avgProgression = calculateAverageProgression(exerciseWeights);
    const trend = detectTrend(exerciseWeights);
    const frequency = calculateTrainingFrequency(workouts);
    
    // Prédiction basée sur la progression moyenne
    let predictedWeight = lastWeight + avgProgression;
    
    // Ajustements basés sur les facteurs
    const factors = [];
    
    // Ajustement selon la fréquence d'entraînement
    if (frequency >= 3) {
      predictedWeight += 0.5; // Progression plus rapide si entraînement fréquent
      factors.push('Entraînement fréquent (+0.5kg)');
    } else if (frequency < 1) {
      predictedWeight -= 0.5; // Progression plus lente si entraînement rare
      factors.push('Entraînement rare (-0.5kg)');
    }
    
    // Ajustement selon la tendance
    if (trend === 'increasing') {
      predictedWeight += 0.25;
      factors.push('Tendance positive (+0.25kg)');
    } else if (trend === 'decreasing') {
      predictedWeight -= 0.25;
      factors.push('Tendance négative (-0.25kg)');
    }
    
    // Limiter les prédictions réalistes
    predictedWeight = Math.max(0, Math.min(predictedWeight, lastWeight * 1.2));
    
    // Calculer la confiance
    let confidence = Math.min(0.9, exerciseWeights.length * 0.1);
    if (exerciseWeights.length >= 10) confidence = 0.9;
    
    // Générer une recommandation
    let recommendation = '';
    if (predictedWeight > lastWeight) {
      recommendation = `Essayez ${predictedWeight.toFixed(1)}kg (+${(predictedWeight - lastWeight).toFixed(1)}kg)`;
    } else if (predictedWeight < lastWeight) {
      recommendation = `Maintenez ${lastWeight}kg ou réduisez légèrement`;
    } else {
      recommendation = `Maintenez ${lastWeight}kg`;
    }
    
    return {
      predictedWeight: Math.round(predictedWeight * 10) / 10, // Arrondir à 0.1kg
      confidence: Math.round(confidence * 100),
      trend,
      recommendation,
      factors,
      lastWeight,
      progression: avgProgression,
      frequency: Math.round(frequency * 10) / 10
    };
    
  } catch (error) {
    console.error('Erreur dans la prédiction de poids:', error);
    return {
      predictedWeight: currentWeight || 0,
      confidence: 0,
      trend: 'error',
      recommendation: 'Erreur de prédiction',
      factors: []
    };
  }
};

// Fonction pour obtenir des insights sur la progression
export const getProgressionInsights = (exerciseName, workouts) => {
  const prediction = predictNextWeight(exerciseName, workouts);
  
  const insights = [];
  
  if (prediction.confidence > 70) {
    insights.push(`🎯 Prédiction fiable (${prediction.confidence}% de confiance)`);
  } else if (prediction.confidence > 40) {
    insights.push(`📊 Prédiction modérée (${prediction.confidence}% de confiance)`);
  } else {
    insights.push(`❓ Prédiction faible (${prediction.confidence}% de confiance)`);
  }
  
  if (prediction.trend === 'increasing') {
    insights.push('📈 Progression positive détectée');
  } else if (prediction.trend === 'decreasing') {
    insights.push('📉 Progression en baisse détectée');
  } else {
    insights.push('➡️ Progression stable');
  }
  
  if (prediction.frequency >= 3) {
    insights.push('🔥 Fréquence d\'entraînement excellente');
  } else if (prediction.frequency >= 2) {
    insights.push('💪 Fréquence d\'entraînement bonne');
  } else {
    insights.push('⚠️ Fréquence d\'entraînement faible');
  }
  
  return {
    ...prediction,
    insights
  };
};

// Fonction pour analyser tous les exercices d'un utilisateur
export const analyzeAllExercises = (workouts) => {
  const exerciseAnalysis = {};
  
  // Extraire tous les exercices uniques
  const uniqueExercises = new Set();
  workouts.forEach(workout => {
    workout.exercises?.forEach(exercise => {
      if (exercise.name) {
        uniqueExercises.add(exercise.name);
      }
    });
  });
  
  // Analyser chaque exercice
  uniqueExercises.forEach(exerciseName => {
    exerciseAnalysis[exerciseName] = getProgressionInsights(exerciseName, workouts);
  });
  
  return exerciseAnalysis;
}; 