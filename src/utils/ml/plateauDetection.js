/**
 * Système avancé de détection de plateau avec analyse comportementale et recommandations IA
 * Utilise des algorithmes de détection de tendances et d'analyse de patterns
 */

// Les contraintes sont utilisées dans d'autres parties du système

/**
 * Types de plateaux détectés
 */
export const PLATEAU_TYPES = {
  WEIGHT: 'weight',           // Plateau de poids (pas de progression)
  VOLUME: 'volume',          // Plateau de volume (reps × sets)
  INTENSITY: 'intensity',    // Plateau d'intensité
  FREQUENCY: 'frequency',    // Baisse de fréquence d'entraînement
  MOTIVATIONAL: 'motivational' // Plateau motivationnel (patterns comportementaux)
};

/**
 * Niveaux de sévérité des plateaux
 */
export const PLATEAU_SEVERITY = {
  MILD: { level: 'mild', weeks: 2, color: 'yellow', impact: 'Léger ralentissement' },
  MODERATE: { level: 'moderate', weeks: 4, color: 'orange', impact: 'Stagnation notable' },
  SEVERE: { level: 'severe', weeks: 6, color: 'red', impact: 'Plateau sévère' },
  CRITICAL: { level: 'critical', weeks: 8, color: 'darkred', impact: 'Régression possible' }
};

/**
 * Classe principale pour la détection avancée de plateaux
 */
export class AdvancedPlateauDetector {
  constructor(options = {}) {
    this.minDataPoints = options.minDataPoints || 5;
    this.sensitivityWeight = options.sensitivityWeight || 0.8;
    this.trendWindowSize = options.trendWindowSize || 6; // Semaines
    this.volumeThreshold = options.volumeThreshold || 0.05; // 5% variation
    this.frequencyThreshold = options.frequencyThreshold || 0.3; // 30% baisse
    
    // Seuils adaptatifs selon le niveau utilisateur
    this.levelThresholds = {
      beginner: { weight: 0.02, volume: 0.03, sensitivity: 1.2 },
      intermediate: { weight: 0.01, volume: 0.02, sensitivity: 1.0 },
      advanced: { weight: 0.005, volume: 0.015, sensitivity: 0.8 }
    };
  }

  /**
   * Analyse complète des plateaux pour un exercice
   */
  analyzeExercisePlateau(exerciseName, exerciseHistory, userLevel = 'intermediate') {
    if (!exerciseHistory || exerciseHistory.length < this.minDataPoints) {
      return {
        hasPlateaus: false,
        detectedPlateaus: [],
        overallSeverity: 'none',
        recommendations: ['📊 Continuez à enregistrer vos performances pour une analyse précise'],
        confidence: 0
      };
    }

    // Préparer les données temporelles
    const timeSeriesData = this.prepareTimeSeriesData(exerciseHistory);
    
    // Détecter tous les types de plateaux
    const weightPlateau = this.detectWeightPlateau(timeSeriesData, userLevel);
    const volumePlateau = this.detectVolumePlateau(timeSeriesData, userLevel);
    const intensityPlateau = this.detectIntensityPlateau(timeSeriesData, userLevel);
    const frequencyPlateau = this.detectFrequencyPlateau(timeSeriesData, userLevel);
    const motivationalPlateau = this.detectMotivationalPlateau(timeSeriesData, userLevel);

    // Combiner les plateaux détectés
    const detectedPlateaus = [
      weightPlateau,
      volumePlateau,
      intensityPlateau,
      frequencyPlateau,
      motivationalPlateau
    ].filter(plateau => plateau.detected);

    // Calculer la sévérité globale
    const overallSeverity = this.calculateOverallSeverity(detectedPlateaus);
    
    // Générer des recommandations intelligentes
    const recommendations = this.generatePlateauRecommendations(
      detectedPlateaus, 
      exerciseName, 
      userLevel, 
      timeSeriesData
    );

    // Calculer la confiance de détection
    const confidence = this.calculateDetectionConfidence(detectedPlateaus, timeSeriesData);

    return {
      hasPlateaus: detectedPlateaus.length > 0,
      detectedPlateaus,
      overallSeverity,
      recommendations,
      confidence,
      analysisDetails: {
        dataPoints: timeSeriesData.length,
        timeSpan: this.calculateTimeSpan(timeSeriesData),
        trendAnalysis: this.analyzeTrends(timeSeriesData)
      }
    };
  }

  /**
   * Détecte les plateaux de poids
   */
  detectWeightPlateau(data, userLevel) {
    const threshold = this.levelThresholds[userLevel].weight;
    const recentWeights = data.slice(-this.trendWindowSize).map(d => d.maxWeight);
    
    if (recentWeights.length < 4) {
      return { detected: false, type: PLATEAU_TYPES.WEIGHT };
    }

    // Calculer la variance et la tendance
    const weightVariance = this.calculateVariance(recentWeights);
    const trend = this.calculateTrend(recentWeights);
    const stagnationWeeks = this.calculateStagnationPeriod(recentWeights, threshold);

    // Conditions de plateau de poids
    const isFlat = Math.abs(trend) < threshold;
    const lowVariance = weightVariance < (threshold * 2);
    const prolongedStagnation = stagnationWeeks >= 3;

    const detected = isFlat && lowVariance && prolongedStagnation;

    if (!detected) {
      return { detected: false, type: PLATEAU_TYPES.WEIGHT };
    }

    // Déterminer la sévérité
    const severity = this.determinePlateauSeverity(stagnationWeeks);

    return {
      detected: true,
      type: PLATEAU_TYPES.WEIGHT,
      severity: severity.level,
      weeksStuck: stagnationWeeks,
      currentWeight: recentWeights[recentWeights.length - 1],
      maxWeight: Math.max(...recentWeights),
      trend: trend,
      variance: weightVariance,
      details: {
        message: `Poids stagnant depuis ${stagnationWeeks} semaines`,
        impact: severity.impact,
        color: severity.color
      }
    };
  }

  /**
   * Détecte les plateaux de volume
   */
  detectVolumePlateau(data, userLevel) {
    const threshold = this.levelThresholds[userLevel].volume;
    const recentVolumes = data.slice(-this.trendWindowSize).map(d => d.totalVolume || d.reps * d.weight);
    
    if (recentVolumes.length < 4) {
      return { detected: false, type: PLATEAU_TYPES.VOLUME };
    }

    const volumeTrend = this.calculateTrend(recentVolumes);
    const volumeVariance = this.calculateVariance(recentVolumes);
    const stagnationWeeks = this.calculateStagnationPeriod(recentVolumes, threshold);

    const detected = Math.abs(volumeTrend) < threshold && stagnationWeeks >= 3;

    if (!detected) {
      return { detected: false, type: PLATEAU_TYPES.VOLUME };
    }

    const severity = this.determinePlateauSeverity(stagnationWeeks);

    return {
      detected: true,
      type: PLATEAU_TYPES.VOLUME,
      severity: severity.level,
      weeksStuck: stagnationWeeks,
      currentVolume: recentVolumes[recentVolumes.length - 1],
      maxVolume: Math.max(...recentVolumes),
      trend: volumeTrend,
      variance: volumeVariance,
      details: {
        message: `Volume d'entraînement stagnant depuis ${stagnationWeeks} semaines`,
        impact: severity.impact,
        color: severity.color
      }
    };
  }

  /**
   * Détecte les plateaux d'intensité
   */
  detectIntensityPlateau(data, userLevel) {
    const recentData = data.slice(-this.trendWindowSize);
    
    if (recentData.length < 4) {
      return { detected: false, type: PLATEAU_TYPES.INTENSITY };
    }

    // Calculer l'intensité relative (% de 1RM estimé)
    const intensityScores = recentData.map(d => {
      const estimatedMax = d.weight * (1 + d.reps / 30); // Formule Epley simplifiée
      return (d.weight / estimatedMax) * 100;
    });

    const intensityTrend = this.calculateTrend(intensityScores);
    const intensityVariance = this.calculateVariance(intensityScores);
    const stagnationWeeks = this.calculateStagnationPeriod(intensityScores, 2); // 2% seuil

    const detected = Math.abs(intensityTrend) < 1 && intensityVariance < 3 && stagnationWeeks >= 4;

    if (!detected) {
      return { detected: false, type: PLATEAU_TYPES.INTENSITY };
    }

    const severity = this.determinePlateauSeverity(stagnationWeeks);

    return {
      detected: true,
      type: PLATEAU_TYPES.INTENSITY,
      severity: severity.level,
      weeksStuck: stagnationWeeks,
      currentIntensity: intensityScores[intensityScores.length - 1],
      maxIntensity: Math.max(...intensityScores),
      trend: intensityTrend,
      details: {
        message: `Intensité d'entraînement stagnante depuis ${stagnationWeeks} semaines`,
        impact: severity.impact,
        color: severity.color
      }
    };
  }

  /**
   * Détecte les plateaux de fréquence
   */
  detectFrequencyPlateau(data, userLevel) {
    if (data.length < 8) {
      return { detected: false, type: PLATEAU_TYPES.FREQUENCY };
    }

    // Calculer la fréquence hebdomadaire récente vs passée
    const recentPeriod = data.slice(-4); // 4 dernières semaines
    const previousPeriod = data.slice(-8, -4); // 4 semaines précédentes

    const recentFreq = recentPeriod.length;
    const previousFreq = previousPeriod.length;
    const frequencyDrop = (previousFreq - recentFreq) / Math.max(previousFreq, 1);

    const detected = frequencyDrop > this.frequencyThreshold && recentFreq < 2;

    if (!detected) {
      return { detected: false, type: PLATEAU_TYPES.FREQUENCY };
    }

    const severity = frequencyDrop > 0.5 ? PLATEAU_SEVERITY.SEVERE : 
                     frequencyDrop > 0.3 ? PLATEAU_SEVERITY.MODERATE : PLATEAU_SEVERITY.MILD;

    return {
      detected: true,
      type: PLATEAU_TYPES.FREQUENCY,
      severity: severity.level,
      weeksStuck: Math.round(4 - recentFreq),
      frequencyDrop: Math.round(frequencyDrop * 100),
      currentFrequency: recentFreq,
      previousFrequency: previousFreq,
      details: {
        message: `Fréquence d'entraînement réduite de ${Math.round(frequencyDrop * 100)}%`,
        impact: severity.impact,
        color: severity.color
      }
    };
  }

  /**
   * Détecte les plateaux motivationnels basés sur les patterns comportementaux
   */
  detectMotivationalPlateau(data, userLevel) {
    if (data.length < 6) {
      return { detected: false, type: PLATEAU_TYPES.MOTIVATIONAL };
    }

    const recentData = data.slice(-6);
    
    // Indicateurs de baisse motivationnelle
    const indicators = {
      // Baisse du volume par séance
      volumeDecline: this.detectVolumeDecline(recentData),
      // Séances plus courtes
      durationDecline: this.detectDurationDecline(recentData),
      // Moins de variété dans les exercices
      varietyDecline: this.detectVarietyDecline(recentData),
      // Intervalles plus longs entre séances
      irregularityIncrease: this.detectIrregularityIncrease(recentData)
    };

    const positiveIndicators = Object.values(indicators).filter(i => i).length;
    const detected = positiveIndicators >= 2;

    if (!detected) {
      return { detected: false, type: PLATEAU_TYPES.MOTIVATIONAL };
    }

    const severity = positiveIndicators >= 3 ? PLATEAU_SEVERITY.SEVERE : PLATEAU_SEVERITY.MODERATE;

    return {
      detected: true,
      type: PLATEAU_TYPES.MOTIVATIONAL,
      severity: severity.level,
      weeksStuck: 4, // Par défaut pour le motivationnel
      indicators: indicators,
      positiveIndicators: positiveIndicators,
      details: {
        message: `Signaux de baisse motivationnelle détectés (${positiveIndicators} indicateurs)`,
        impact: severity.impact,
        color: severity.color
      }
    };
  }

  /**
   * Génère des recommandations intelligentes basées sur les plateaux détectés
   */
  generatePlateauRecommendations(plateaus, exerciseName, userLevel, data) {
    if (plateaus.length === 0) {
      return ['🎯 Progression normale - Continuez ainsi !'];
    }

    const recommendations = new Set();
    const exerciseType = this.determineExerciseType(exerciseName);

    plateaus.forEach(plateau => {
      switch (plateau.type) {
        case PLATEAU_TYPES.WEIGHT:
          recommendations.add(...this.getWeightPlateauRecommendations(plateau, exerciseType, userLevel));
          break;
        case PLATEAU_TYPES.VOLUME:
          recommendations.add(...this.getVolumePlateauRecommendations(plateau, exerciseType, userLevel));
          break;
        case PLATEAU_TYPES.INTENSITY:
          recommendations.add(...this.getIntensityPlateauRecommendations(plateau, exerciseType, userLevel));
          break;
        case PLATEAU_TYPES.FREQUENCY:
          recommendations.add(...this.getFrequencyPlateauRecommendations(plateau, userLevel));
          break;
        case PLATEAU_TYPES.MOTIVATIONAL:
          recommendations.add(...this.getMotivationalPlateauRecommendations(plateau, userLevel));
          break;
        default:
          recommendations.add('📊 Type de plateau non reconnu - Analyse supplémentaire requise');
          break;
      }
    });

    // Ajouter des recommandations générales selon la sévérité
    const maxSeverity = this.getMaxSeverity(plateaus);
    recommendations.add(...this.getGeneralRecommendations(maxSeverity, exerciseType, userLevel));

    return Array.from(recommendations).slice(0, 6); // Limiter à 6 recommandations
  }

  /**
   * Recommandations pour plateau de poids
   */
  getWeightPlateauRecommendations(plateau, exerciseType, userLevel) {
    const recommendations = [];

    switch (plateau.severity) {
      case 'mild':
        recommendations.push('📈 Augmentez légèrement l\'intensité (plus de reps ou poids)');
        recommendations.push('⏰ Augmentez les temps de repos entre séries (3-5 min)');
        break;
      case 'moderate':
        recommendations.push('🔄 Changez la méthode d\'entraînement (séries dégressives, rest-pause)');
        recommendations.push('📊 Variez les ranges de répétitions (6-8, 8-12, 12-15)');
        recommendations.push('🎯 Travaillez les muscles auxiliaires pour renforcer le mouvement');
        break;
      case 'severe':
      case 'critical':
        recommendations.push('🔄 Période de décharge recommandée (2 semaines à -20% intensité)');
        recommendations.push('🏋️ Changement d\'exercice similaire recommandé');
        recommendations.push('📉 Réduisez temporairement la fréquence pour optimiser la récupération');
        break;
      default:
        recommendations.push('📊 Continuez à surveiller votre progression');
        break;
    }

    // Recommandations spécifiques selon le type d'exercice
    if (exerciseType === 'compound') {
      recommendations.push('⚡ Travaillez les points faibles du mouvement (sticking points)');
    } else {
      recommendations.push('🔥 Augmentez la fréquence d\'entraînement de ce muscle');
    }

    return recommendations;
  }

  /**
   * Recommandations pour plateau de volume
   */
  getVolumePlateauRecommendations(plateau, exerciseType, userLevel) {
    return [
      '📊 Augmentez le nombre de séries progressivement (+1 série/semaine)',
      '⚡ Utilisez des techniques d\'intensification (drop sets, supersets)',
      '🎯 Variez les exercices complémentaires pour stimuler la croissance',
      '⏰ Optimisez votre récupération (sommeil, nutrition, stress)'
    ];
  }

  /**
   * Recommandations pour plateau d'intensité
   */
  getIntensityPlateauRecommendations(plateau, exerciseType, userLevel) {
    return [
      '🔥 Intégrez des séances à haute intensité (85%+ 1RM)',
      '⚡ Utilisez des techniques de pré-fatigue ou post-activation',
      '📈 Testez votre 1RM pour recalibrer vos pourcentages',
      '🎯 Focalisez sur la qualité du mouvement et la connexion neuromusculaire'
    ];
  }

  /**
   * Recommandations pour plateau de fréquence
   */
  getFrequencyPlateauRecommendations(plateau, userLevel) {
    return [
      '📅 Planifiez vos séances à l\'avance pour maintenir la régularité',
      '⏰ Réduisez la durée des séances si le temps est un problème',
      '🎯 Fixez-vous des objectifs hebdomadaires réalistes',
      '💪 Intégrez des mini-séances ou du travail à domicile'
    ];
  }

  /**
   * Recommandations pour plateau motivationnel
   */
  getMotivationalPlateauRecommendations(plateau, userLevel) {
    return [
      '🎯 Fixez-vous de nouveaux objectifs stimulants',
      '🔄 Variez complètement votre programme d\'entraînement',
      '👥 Trouvez un partenaire d\'entraînement ou rejoignez une communauté',
      '🏆 Participez à un défi ou une compétition amicale',
      '📱 Essayez de nouveaux exercices ou équipements'
    ];
  }

  // Méthodes utilitaires pour les calculs statistiques

  prepareTimeSeriesData(exerciseHistory) {
    return exerciseHistory
      .map(entry => ({
        date: new Date(entry.date || entry.timestamp),
        weight: entry.weight,
        maxWeight: entry.maxWeight || entry.weight,
        reps: entry.reps || entry.totalReps || 8,
        sets: entry.sets || 3,
        totalVolume: (entry.weight || 0) * (entry.reps || 8) * (entry.sets || 3),
        duration: entry.duration || 0
      }))
      .sort((a, b) => a.date - b.date);
  }

  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, idx) => sum + idx * val, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope || 0;
  }

  calculateVariance(values) {
    if (values.length < 2) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  calculateStagnationPeriod(values, threshold) {
    if (values.length < 2) return 0;
    
    let stagnationWeeks = 0;
    for (let i = values.length - 1; i > 0; i--) {
      const change = Math.abs((values[i] - values[i-1]) / Math.max(values[i-1], 1));
      if (change < threshold) {
        stagnationWeeks++;
      } else {
        break;
      }
    }
    return stagnationWeeks;
  }

  determinePlateauSeverity(weeksStuck) {
    if (weeksStuck >= PLATEAU_SEVERITY.CRITICAL.weeks) return PLATEAU_SEVERITY.CRITICAL;
    if (weeksStuck >= PLATEAU_SEVERITY.SEVERE.weeks) return PLATEAU_SEVERITY.SEVERE;
    if (weeksStuck >= PLATEAU_SEVERITY.MODERATE.weeks) return PLATEAU_SEVERITY.MODERATE;
    return PLATEAU_SEVERITY.MILD;
  }

  calculateOverallSeverity(plateaus) {
    if (plateaus.length === 0) return 'none';
    
    const severityScores = {
      'mild': 1,
      'moderate': 2,
      'severe': 3,
      'critical': 4
    };

    const totalScore = plateaus.reduce((sum, plateau) => 
      sum + (severityScores[plateau.severity] || 0), 0
    );
    
    const averageScore = totalScore / plateaus.length;
    
    if (averageScore >= 3.5) return 'critical';
    if (averageScore >= 2.5) return 'severe';
    if (averageScore >= 1.5) return 'moderate';
    return 'mild';
  }

  calculateDetectionConfidence(plateaus, data) {
    let confidence = 50; // Base
    
    // Plus de données = plus de confiance
    confidence += Math.min(data.length * 2, 30);
    
    // Plusieurs plateaux détectés = plus de confiance
    confidence += plateaus.length * 5;
    
    // Plateaux sévères = plus de confiance
    const severeCount = plateaus.filter(p => p.severity === 'severe' || p.severity === 'critical').length;
    confidence += severeCount * 10;
    
    return Math.min(confidence, 95);
  }

  calculateTimeSpan(data) {
    if (data.length < 2) return 0;
    const first = data[0].date;
    const last = data[data.length - 1].date;
    return Math.round((last - first) / (1000 * 60 * 60 * 24 * 7)); // Semaines
  }

  analyzeTrends(data) {
    const weights = data.map(d => d.weight);
    const volumes = data.map(d => d.totalVolume);
    
    return {
      weightTrend: this.calculateTrend(weights),
      volumeTrend: this.calculateTrend(volumes),
      weightVariance: this.calculateVariance(weights),
      volumeVariance: this.calculateVariance(volumes)
    };
  }

  determineExerciseType(exerciseName) {
    const compoundKeywords = ['squat', 'deadlift', 'bench', 'press', 'pull', 'row', 'clean'];
    const name = exerciseName.toLowerCase();
    return compoundKeywords.some(keyword => name.includes(keyword)) ? 'compound' : 'isolation';
  }

  // Détecteurs spécialisés pour plateau motivationnel

  detectVolumeDecline(data) {
    if (data.length < 4) return false;
    const recent = data.slice(-2);
    const previous = data.slice(-4, -2);
    const recentAvg = recent.reduce((sum, d) => sum + d.totalVolume, 0) / recent.length;
    const previousAvg = previous.reduce((sum, d) => sum + d.totalVolume, 0) / previous.length;
    return (previousAvg - recentAvg) / Math.max(previousAvg, 1) > 0.15; // 15% baisse
  }

  detectDurationDecline(data) {
    if (data.length < 4) return false;
    const durations = data.map(d => d.duration).filter(d => d > 0);
    if (durations.length < 4) return false;
    return this.calculateTrend(durations) < -2; // Tendance négative significative
  }

  detectVarietyDecline(data) {
    // Simplifié: assume moins de variété si répétition exacte des mêmes poids/reps
    const recent = data.slice(-3);
    const weights = recent.map(d => d.weight);
    const reps = recent.map(d => d.reps);
    return new Set(weights).size === 1 && new Set(reps).size === 1;
  }

  detectIrregularityIncrease(data) {
    if (data.length < 4) return false;
    const intervals = [];
    for (let i = 1; i < data.length; i++) {
      const daysDiff = (data[i].date - data[i-1].date) / (1000 * 60 * 60 * 24);
      intervals.push(daysDiff);
    }
    const variance = this.calculateVariance(intervals);
    return variance > 20; // Haute irrégularité (> 20 jours de variance)
  }

  getMaxSeverity(plateaus) {
    const severityOrder = ['mild', 'moderate', 'severe', 'critical'];
    return plateaus.reduce((max, plateau) => {
      const currentIndex = severityOrder.indexOf(plateau.severity);
      const maxIndex = severityOrder.indexOf(max);
      return currentIndex > maxIndex ? plateau.severity : max;
    }, 'mild');
  }

  getGeneralRecommendations(severity, exerciseType, userLevel) {
    const general = {
      'mild': [
        '📊 Tenez un journal détaillé pour suivre vos progrès',
        '🍎 Vérifiez que votre nutrition soutient vos objectifs'
      ],
      'moderate': [
        '😴 Priorisez la récupération (7-9h de sommeil/nuit)',
        '💧 Assurez-vous d\'être bien hydraté(e)'
      ],
      'severe': [
        '🩺 Consultez un coach ou un professionnel de santé',
        '🧘 Intégrez des techniques de récupération active (yoga, méditation)'
      ],
      'critical': [
        '⛑️ Pause complète recommandée (1-2 semaines)',
        '👨‍⚕️ Consultation médicale conseillée pour exclure tout problème'
      ]
    };

    return general[severity] || general['mild'];
  }
}

/**
 * Fonction helper pour analyse rapide de plateau
 */
export function analyzeExercisePlateauQuick(exerciseName, exerciseHistory, userLevel = 'intermediate') {
  const detector = new AdvancedPlateauDetector();
  return detector.analyzeExercisePlateau(exerciseName, exerciseHistory, userLevel);
}

/**
 * Fonction helper pour détecter plateau global sur tous les exercices
 */
export function analyzeGlobalPlateauTrends(allExercisesData, userLevel = 'intermediate') {
  const detector = new AdvancedPlateauDetector();
  const globalAnalysis = {
    totalExercises: 0,
    exercisesWithPlateaus: 0,
    plateauTypes: {},
    overallSeverity: 'none',
    globalRecommendations: []
  };

  Object.entries(allExercisesData).forEach(([exerciseName, history]) => {
    const analysis = detector.analyzeExercisePlateau(exerciseName, history, userLevel);
    globalAnalysis.totalExercises++;
    
    if (analysis.hasPlateaus) {
      globalAnalysis.exercisesWithPlateaus++;
      analysis.detectedPlateaus.forEach(plateau => {
        globalAnalysis.plateauTypes[plateau.type] = 
          (globalAnalysis.plateauTypes[plateau.type] || 0) + 1;
      });
    }
  });

  // Déterminer la sévérité globale
  const plateauRatio = globalAnalysis.exercisesWithPlateaus / Math.max(globalAnalysis.totalExercises, 1);
  if (plateauRatio > 0.7) globalAnalysis.overallSeverity = 'critical';
  else if (plateauRatio > 0.5) globalAnalysis.overallSeverity = 'severe';
  else if (plateauRatio > 0.3) globalAnalysis.overallSeverity = 'moderate';
  else if (plateauRatio > 0.1) globalAnalysis.overallSeverity = 'mild';

  // Recommandations globales
  if (globalAnalysis.overallSeverity !== 'none') {
    globalAnalysis.globalRecommendations = [
      '🔄 Restructuration complète du programme recommandée',
      '📊 Analyse approfondie de votre récupération et nutrition',
      '🎯 Fixation de nouveaux objectifs et méthodes d\'entraînement'
    ];
  }

  return globalAnalysis;
}

export default AdvancedPlateauDetector;