/**
 * Pipeline ML avancé principal pour orchestrer tous les composants
 * Gère l'entraînement, la prédiction, la validation et l'apprentissage continu
 */

import { FeatureEngineer } from './featureEngineering.js';
import { EnsembleModel } from './models/ensembleModel.js';
import { 
  detectStrengthPlateau, 
  MUSCULATION_CONSTRAINTS 
} from './musculationConstraints.js';
import { AdvancedPlateauDetector } from './plateauDetection.js';

/**
 * Classe principale du pipeline ML avancé
 */
export class AdvancedPredictionPipeline {
  constructor(options = {}) {
    // Composants principaux
    this.featureEngineer = new FeatureEngineer();
    this.ensembleModel = new EnsembleModel(options.modelConfig);
    
    // Configuration du pipeline
    this.minDataPoints = options.minDataPoints || 3;
    this.retrainingThreshold = options.retrainingThreshold || 10; // Nouvel exercices
    this.performanceWindow = options.performanceWindow || 30; // Jours
    
    // Détecteur de plateau avancé
    this.plateauDetector = new AdvancedPlateauDetector({
      minDataPoints: options.minDataPoints || 3,
      sensitivityWeight: options.plateauSensitivity || 0.8,
      trendWindowSize: options.plateauWindow || 6
    });
    
    // Cache et persistence
    this.modelCache = new Map();
    this.predictionCache = new Map();
    this.performanceHistory = new Map();
    
    // Métriques du pipeline
    this.pipelineMetrics = {
      totalPredictions: 0,
      averageAccuracy: 0,
      modelPerformances: {},
      retrainingEvents: [],
      errorRates: [],
      lastUpdate: null
    };
    
    // État du pipeline
    this.isInitialized = false;
    this.isTraining = false;
    this.trainingProgress = 0;
  }

  /**
   * Initialise le pipeline avec les données utilisateur
   */
  async initialize(workouts, user = null) {
    
    if (!workouts || workouts.length === 0) {
      throw new Error('Aucune donnée d\'entraînement fournie');
    }
    
    try {
      // Analyser la qualité des données
      const dataQuality = this.analyzeDataQuality(workouts);
      
      if (dataQuality.score < 50) {
      }
      
      // Préparer les données pour l'entraînement
      const trainingData = await this.prepareTrainingData(workouts);
      
      if (trainingData.totalSamples < this.minDataPoints) {
        this.isInitialized = true; // Permettre les prédictions de base
        return {
          initialized: true,
          warning: 'Données insuffisantes pour l\'entraînement ML',
          dataQuality,
          fallbackMode: true
        };
      }
      
      // Entraîner le modèle d'ensemble
      this.isTraining = true;
      this.trainingProgress = 0;
      
      const trainingResults = await this.trainEnsembleModel(trainingData);
      
      this.isTraining = false;
      this.trainingProgress = 100;
      this.isInitialized = true;
      
      // Mettre à jour les métriques
      this.updatePipelineMetrics(trainingResults);
      
      
      return {
        initialized: true,
        dataQuality,
        trainingResults,
        modelPerformance: trainingResults.ensemblePerformance,
        totalSamples: trainingData.totalSamples
      };
      
    } catch (error) {
      this.isTraining = false;
      
      // Mode fallback
      this.isInitialized = true;
      
      return {
        initialized: true,
        error: error.message,
        fallbackMode: true
      };
    }
  }

  /**
   * Fait une prédiction avancée pour un exercice spécifique
   */
  async predict(exerciseName, workouts, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Pipeline non initialisé. Appelez initialize() d\'abord.');
    }
    
    try {
      // Vérifier le cache
      const cacheKey = this.generateCacheKey(exerciseName, workouts);
      if (this.predictionCache.has(cacheKey) && !options.bypassCache) {
        const cached = this.predictionCache.get(cacheKey);
        
        // Vérifier si le cache n'est pas trop ancien (30 minutes)
        if (Date.now() - cached.timestamp < 30 * 60 * 1000) {
          cached.prediction.fromCache = true;
          return cached.prediction;
        }
      }
      
      // 1. Extraction des features avancées
      const features = this.featureEngineer.extractExerciseFeatures(exerciseName, workouts);
      
      if (features.totalDataPoints === 0) {
        return this.generateFallbackPrediction(exerciseName, features);
      }
      
      // 2. Détection de plateau avancée
      const basicPlateauAnalysis = detectStrengthPlateau(features.exerciseHistory);
      const advancedPlateauAnalysis = await this.performAdvancedPlateauAnalysis(
        exerciseName, 
        features.exerciseHistory,
        features.userLevel || 'intermediate'
      );
      
      // 3. Prédiction avec le modèle d'ensemble
      let ensemblePrediction = null;
      let modelConfidence = 50;
      
      if (this.ensembleModel.isTrained && features.totalDataPoints >= this.minDataPoints) {
        ensemblePrediction = this.ensembleModel.predict(features);
        modelConfidence = ensemblePrediction.confidence;
      } else {
        // Prédiction de fallback basée sur les règles
        ensemblePrediction = this.generateRuleBasedPrediction(features);
      }
      
      // 4. Post-traitement et validation avec analyse de plateau avancée
      const validatedPrediction = this.postProcessPrediction(
        ensemblePrediction, 
        features, 
        advancedPlateauAnalysis,
        options
      );
      
      // 5. Génération des insights et explications
      const insights = this.generatePredictionInsights(
        validatedPrediction,
        features,
        advancedPlateauAnalysis,
        ensemblePrediction
      );
      
      // 6. Recommandations personnalisées avec analyse de plateau avancée
      const recommendations = this.generateAdvancedRecommendations(
        validatedPrediction,
        insights,
        advancedPlateauAnalysis,
        features
      );
      
      // 7. Préparer la réponse finale
      const currentWeight = features.currentWeight || features.current_weight || 0;
      const predictedWeight = validatedPrediction.validatedPrediction;
      const actualIncrement = predictedWeight - currentWeight; // Recalculer pour assurer la cohérence
      
      const finalPrediction = {
        // Prédiction principale
        exerciseName,
        predictedWeight: predictedWeight,
        currentWeight: currentWeight,
        increment: actualIncrement, // Utiliser l'increment recalculé
        confidence: modelConfidence,
        
        // Analyses avancées
        plateauAnalysis: advancedPlateauAnalysis,
        basicPlateauAnalysis, // Conserver aussi l'ancienne pour compatibilité
        insights,
        recommendations,
        
        // Détails ML
        modelInfo: ensemblePrediction?.modelInfo || { type: 'Fallback' },
        features: this.getKeyFeatures(features),
        constraints: validatedPrediction.constraints || [],
        
        // Métadonnées
        timestamp: Date.now(),
        dataQuality: this.assessPredictionQuality(features),
        explainability: this.generateExplanation(validatedPrediction, features, ensemblePrediction)
      };
      
      // 8. Mise en cache
      this.predictionCache.set(cacheKey, {
        prediction: finalPrediction,
        timestamp: Date.now()
      });
      
      // 9. Mise à jour des métriques
      this.updatePredictionMetrics(finalPrediction);
      
      return finalPrediction;
      
    } catch (error) {
      
      // Prédiction de fallback en cas d'erreur
      return this.generateErrorFallbackPrediction(exerciseName, error.message);
    }
  }

  /**
   * Analyse tous les exercices d'un utilisateur
   */
  async analyzeAllExercises(workouts) {
    if (!workouts || workouts.length === 0) {
      return {};
    }
    
    // Extraire tous les exercices uniques
    const exerciseNames = new Set();
    workouts.forEach(workout => {
      if (workout.exercises) {
        workout.exercises.forEach(exercise => {
          exerciseNames.add(exercise.name);
        });
      }
    });
    
    // Analyser chaque exercice
    const analyses = {};
    const promises = Array.from(exerciseNames).map(async (exerciseName) => {
      try {
        const prediction = await this.predict(exerciseName, workouts);
        analyses[exerciseName] = prediction;
      } catch (error) {
        analyses[exerciseName] = this.generateErrorFallbackPrediction(exerciseName, error.message);
      }
    });
    
    await Promise.all(promises);
    
    return analyses;
  }

  /**
   * Prépare les données d'entraînement
   */
  async prepareTrainingData(workouts) {
    const trainingData = {
      features: [],
      targets: [],
      exerciseData: {},
      totalSamples: 0
    };
    
    // Extraire les données pour chaque exercice
    const exerciseNames = new Set();
    workouts.forEach(workout => {
      if (workout.exercises) {
        workout.exercises.forEach(exercise => {
          exerciseNames.add(exercise.name);
        });
      }
    });
    
    // Préparer les données pour l'entraînement supervisé
    for (const exerciseName of exerciseNames) {
      const exerciseFeatures = this.featureEngineer.extractExerciseFeatures(exerciseName, workouts);
      
      if (exerciseFeatures.exerciseHistory.length >= 3) {
        // Créer des paires (features, target) pour l'apprentissage supervisé
        const history = exerciseFeatures.exerciseHistory;
        
        for (let i = 2; i < history.length; i++) {
          // Features: basées sur l'historique jusqu'à i-1
          const historicalWorkouts = workouts.filter(w => 
            new Date(w.date).getTime() <= history[i-1].timestamp
          );
          
          const features = this.featureEngineer.extractExerciseFeatures(
            exerciseName, 
            historicalWorkouts
          );
          
          // Target: poids actuel à l'index i
          const target = history[i].weight;
          
          if (target > 0 && features.currentWeight > 0) {
            trainingData.features.push(this.convertFeaturesToArray(features));
            trainingData.targets.push(target);
            trainingData.totalSamples++;
          }
        }
        
        trainingData.exerciseData[exerciseName] = exerciseFeatures;
      }
    }
    
    return trainingData;
  }

  /**
   * Entraîne le modèle d'ensemble
   */
  async trainEnsembleModel(trainingData) {
    if (trainingData.totalSamples < this.minDataPoints) {
      throw new Error(`Pas assez d'échantillons d'entraînement: ${trainingData.totalSamples}`);
    }
    
    this.trainingProgress = 10;
    
    try {
      // Configuration d'entraînement adaptée à la taille des données
      const trainingOptions = this.adaptTrainingOptions(trainingData);
      
      this.trainingProgress = 30;
      
      // Entraînement du modèle d'ensemble
      const results = await this.ensembleModel.train(
        trainingData.features,
        trainingData.targets,
        trainingOptions
      );
      
      this.trainingProgress = 80;
      
      // Validation des performances
      const validationResults = this.validateModelPerformance(results, trainingData);
      
      this.trainingProgress = 95;
      
      return {
        ...results,
        validation: validationResults,
        trainingSamples: trainingData.totalSamples,
        exerciseCount: Object.keys(trainingData.exerciseData).length
      };
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Adapte les options d'entraînement selon les données
   */
  adaptTrainingOptions(trainingData) {
    const sampleCount = trainingData.totalSamples;
    
    // Adapter selon la taille des données
    if (sampleCount < 20) {
      return {
        validationSplit: 0.1,
        linear: { maxIterations: 500, regularization: 0.05 },
        forest: { nTrees: 8, maxDepth: 4 },
        neural: { epochs: 100, batchSize: Math.max(4, Math.floor(sampleCount * 0.3)) }
      };
    } else if (sampleCount < 100) {
      return {
        validationSplit: 0.2,
        linear: { maxIterations: 1000, regularization: 0.01 },
        forest: { nTrees: 12, maxDepth: 5 },
        neural: { epochs: 200, batchSize: Math.max(8, Math.floor(sampleCount * 0.2)) }
      };
    } else {
      return {
        validationSplit: 0.2,
        linear: { maxIterations: 1500, regularization: 0.01 },
        forest: { nTrees: 15, maxDepth: 6 },
        neural: { epochs: 300, batchSize: Math.max(16, Math.floor(sampleCount * 0.15)) }
      };
    }
  }

  /**
   * Effectue une analyse de plateau avancée
   */
  async performAdvancedPlateauAnalysis(exerciseName, exerciseHistory, userLevel) {
    try {
      return this.plateauDetector.analyzeExercisePlateau(exerciseName, exerciseHistory, userLevel);
    } catch (error) {
      // Fallback vers l'analyse basique
      return {
        hasPlateaus: false,
        detectedPlateaus: [],
        overallSeverity: 'none',
        recommendations: [],
        confidence: 0
      };
    }
  }

  /**
   * Post-traite une prédiction
   */
  postProcessPrediction(prediction, features, plateauAnalysis, options = {}) {
    let processedPrediction = { ...prediction };
    
    // Ajustements selon le plateau avancé
    if (plateauAnalysis.hasPlateaus && plateauAnalysis.overallSeverity !== 'none') {
      // Calculer le facteur de pénalité basé sur la sévérité
      const severityPenalties = {
        'mild': 0.8,      // Réduction de 20%
        'moderate': 0.6,  // Réduction de 40%
        'severe': 0.4,    // Réduction de 60%
        'critical': 0.2   // Réduction de 80%
      };
      
      const plateauPenalty = severityPenalties[plateauAnalysis.overallSeverity] || 0.5;
      
      if (processedPrediction.validatedPrediction > features.currentWeight) {
        const originalIncrement = processedPrediction.validatedPrediction - features.currentWeight;
        const adjustedIncrement = originalIncrement * plateauPenalty;
        
        processedPrediction.validatedPrediction = features.currentWeight + adjustedIncrement;
        processedPrediction.increment = adjustedIncrement;
        
        processedPrediction.constraints = processedPrediction.constraints || [];
        processedPrediction.constraints.push(
          `Ajustement plateau ${plateauAnalysis.overallSeverity}: progression réduite de ${Math.round((1-plateauPenalty)*100)}%`
        );
      }
    }
    
    // Ajustements selon le niveau utilisateur
    const userLevel = features.userLevel || 'intermediate';
    const levelConstraints = MUSCULATION_CONSTRAINTS.PROGRESSION_RATES[userLevel];
    
    if (processedPrediction.increment > levelConstraints.max) {
      processedPrediction.validatedPrediction = features.currentWeight + levelConstraints.max;
      processedPrediction.increment = levelConstraints.max;
      
      processedPrediction.constraints = processedPrediction.constraints || [];
      processedPrediction.constraints.push(`Ajustement niveau ${userLevel}: max ${levelConstraints.max}kg`);
    }
    
    return processedPrediction;
  }

  /**
   * Génère des insights de prédiction
   */
  generatePredictionInsights(prediction, features, plateauAnalysis, modelPrediction) {
    const insights = [];
    
    // Insights sur la progression
    if (prediction.increment > 0) {
      if (prediction.increment >= 1.0) {
        insights.push({
          type: 'progression',
          level: 'positive',
          message: `Forte progression prédite: +${prediction.increment.toFixed(1)}kg`,
          confidence: 'high'
        });
      } else {
        insights.push({
          type: 'progression',
          level: 'moderate',
          message: `Progression modérée: +${prediction.increment.toFixed(1)}kg`,
          confidence: 'medium'
        });
      }
    } else {
      insights.push({
        type: 'progression',
        level: 'neutral',
        message: 'Maintien du poids actuel recommandé',
        confidence: 'medium'
      });
    }
    
    // Insights sur les données
    if (features.totalDataPoints < 5) {
      insights.push({
        type: 'data',
        level: 'warning',
        message: `Peu de données disponibles (${features.totalDataPoints} points)`,
        confidence: 'low'
      });
    } else if (features.consistency_score > 70) {
      insights.push({
        type: 'data',
        level: 'positive',
        message: 'Données d\'entraînement très consistantes',
        confidence: 'high'
      });
    }
    
    // Insights sur le plateau
    if (plateauAnalysis.isPlateau) {
      insights.push({
        type: 'plateau',
        level: plateauAnalysis.severity === 'high' ? 'critical' : 'warning',
        message: `Plateau détecté depuis ${plateauAnalysis.weeksStuck} semaines`,
        confidence: 'high'
      });
    }
    
    // Insights sur le modèle
    if (modelPrediction?.modelInfo?.type === 'EnsembleModel') {
      const diversityLevel = modelPrediction.diversityAnalysis?.diversityLevel || 'unknown';
      if (diversityLevel === 'low') {
        insights.push({
          type: 'model',
          level: 'positive',
          message: 'Modèles convergents - Prédiction très fiable',
          confidence: 'high'
        });
      } else if (diversityLevel === 'very_high') {
        insights.push({
          type: 'model',
          level: 'warning',
          message: 'Modèles divergents - Incertitude élevée',
          confidence: 'low'
        });
      }
    }
    
    return insights;
  }

  /**
   * Génère des recommandations avancées
   */
  generateAdvancedRecommendations(prediction, insights, plateauAnalysis, features) {
    const recommendations = [...(prediction.recommendations || [])];
    
    // Recommandations basées sur les insights
    insights.forEach(insight => {
      if (insight.type === 'plateau' && insight.level === 'critical') {
        recommendations.push('🔄 Changement de programme recommandé');
        recommendations.push('📉 Période de décharge (2 semaines à -20% intensité)');
      } else if (insight.type === 'data' && insight.level === 'warning') {
        recommendations.push('📊 Plus de données d\'entraînement amélioreront la précision');
      } else if (insight.type === 'progression' && insight.level === 'positive') {
        recommendations.push('🎯 Progression favorable - Continuez sur cette voie');
      }
    });
    
    // Recommandations basées sur la fréquence
    if (features.frequency_2weeks < 2) {
      recommendations.push('📈 Augmentez la fréquence d\'entraînement pour cet exercice');
    } else if (features.frequency_2weeks > 6) {
      recommendations.push('⏸️ Possible surentraînement - Considérez plus de repos');
    }
    
    // Recommandations selon le type d'exercice
    if (features.exercise_type === 'compound') {
      recommendations.push('💪 Exercice composé - Focus sur la technique');
    } else {
      recommendations.push('🎯 Exercice d\'isolation - Volume et répétitions');
    }
    
    return recommendations;
  }

  // Méthodes utilitaires
  
  generateCacheKey(exerciseName, workouts) {
    const lastWorkout = workouts[workouts.length - 1];
    const hash = exerciseName + (lastWorkout?.date || '') + workouts.length;
    return hash;
  }

  convertFeaturesToArray(features) {
    return [
      features.progression_1week || 0,
      features.progression_2weeks || 0,
      features.progression_4weeks || 0,
      features.frequency_1week || 0,
      features.frequency_2weeks || 0,
      features.consistency_score || 0,
      features.momentum_score || 0,
      features.current_weight || 0,
      features.max_weight || 0,
      features.avg_weight || 0,
      features.total_volume || 0,
      features.intensity_score || 0,
      features.is_compound_exercise ? 1 : 0,
      features.realistic_progression_rate || 0,
      features.exercise_experience || 0
    ];
  }

  getKeyFeatures(features) {
    return {
      progression_2weeks: features.progression_2weeks,
      frequency_2weeks: features.frequency_2weeks,
      consistency_score: features.consistency_score,
      current_weight: features.currentWeight,
      exercise_experience: features.exercise_experience,
      user_level: features.userLevel
    };
  }

  assessPredictionQuality(features) {
    let score = 100;
    
    if (features.totalDataPoints < 5) score -= 30;
    if (features.consistency_score < 50) score -= 20;
    if (features.exercise_experience < 3) score -= 10;
    
    return {
      score: Math.max(0, score),
      level: score > 80 ? 'high' : score > 60 ? 'medium' : 'low'
    };
  }

  generateExplanation(prediction, features, modelPrediction) {
    const explanations = [];
    
    if (modelPrediction?.modelInfo?.type === 'EnsembleModel') {
      explanations.push(`Prédiction basée sur ${modelPrediction.modelInfo.models.length} modèles ML`);
      
      if (modelPrediction.ensembleWeights) {
        const dominantModel = Object.entries(modelPrediction.ensembleWeights)
          .reduce((a, b) => a[1] > b[1] ? a : b)[0];
        explanations.push(`Modèle principal: ${dominantModel}`);
      }
    }
    
    explanations.push(`Basé sur ${features.totalDataPoints} points de données`);
    
    if (features.consistency_score > 70) {
      explanations.push('Données très consistantes');
    }
    
    return explanations;
  }

  generateFallbackPrediction(exerciseName, features) {
    return {
      exerciseName,
      predictedWeight: 0,
      currentWeight: 0,
      increment: 0,
      confidence: 0,
      insights: [{
        type: 'data',
        level: 'info',
        message: 'Aucune donnée disponible pour cet exercice',
        confidence: 'low'
      }],
      recommendations: ['📊 Commencez à enregistrer vos performances pour cet exercice'],
      modelInfo: { type: 'Fallback' },
      timestamp: Date.now()
    };
  }

  generateRuleBasedPrediction(features) {
    // Prédiction simple basée sur des règles
    const currentWeight = features.currentWeight || 0;
    const progression = features.progression_2weeks || 0;
    const frequency = features.frequency_2weeks || 1;
    
    let increment = 0.5; // Défaut
    
    if (progression > 0 && frequency >= 2) {
      increment = Math.min(1.0, progression * 0.5);
    } else if (progression > 0) {
      increment = 0.5;
    }
    
    return {
      rawPrediction: currentWeight + increment,
      validatedPrediction: currentWeight + increment,
      increment,
      confidence: 60,
      modelInfo: { type: 'Fallback' }
    };
  }

  generateErrorFallbackPrediction(exerciseName, errorMessage) {
    return {
      exerciseName,
      predictedWeight: 0,
      currentWeight: 0,
      increment: 0,
      confidence: 0,
      error: errorMessage,
      insights: [{
        type: 'error',
        level: 'critical',
        message: 'Erreur lors de la prédiction',
        confidence: 'low'
      }],
      recommendations: ['🔧 Vérifiez la qualité de vos données d\'entraînement'],
      modelInfo: { type: 'Error' },
      timestamp: Date.now()
    };
  }

  analyzeDataQuality(workouts) {
    let score = 100;
    const issues = [];
    
    if (workouts.length < 5) {
      score -= 30;
      issues.push('Peu d\'entraînements enregistrés');
    }
    
    const exerciseCount = new Set();
    let validExercises = 0;
    
    workouts.forEach(workout => {
      if (workout.exercises) {
        workout.exercises.forEach(exercise => {
          if (exercise.name && exercise.weight > 0) {
            exerciseCount.add(exercise.name);
            validExercises++;
          }
        });
      }
    });
    
    if (exerciseCount.size < 3) {
      score -= 20;
      issues.push('Peu de variété d\'exercices');
    }
    
    if (validExercises < 10) {
      score -= 25;
      issues.push('Peu d\'exercices avec poids valides');
    }
    
    return {
      score: Math.max(0, score),
      level: score > 80 ? 'high' : score > 60 ? 'medium' : 'low',
      issues,
      totalWorkouts: workouts.length,
      uniqueExercises: exerciseCount.size,
      validExercises
    };
  }

  updatePipelineMetrics(trainingResults) {
    this.pipelineMetrics.modelPerformances = trainingResults.ensemblePerformance || {};
    this.pipelineMetrics.retrainingEvents.push({
      timestamp: Date.now(),
      performance: trainingResults.ensemblePerformance
    });
    this.pipelineMetrics.lastUpdate = Date.now();
  }

  updatePredictionMetrics(prediction) {
    this.pipelineMetrics.totalPredictions++;
    
    if (prediction.confidence) {
      // Mise à jour de la confiance moyenne
      const currentAvg = this.pipelineMetrics.averageAccuracy;
      const count = this.pipelineMetrics.totalPredictions;
      this.pipelineMetrics.averageAccuracy = 
        (currentAvg * (count - 1) + prediction.confidence) / count;
    }
  }

  validateModelPerformance(results, trainingData) {
    const validation = {
      isValid: true,
      warnings: [],
      metrics: {}
    };
    
    if (results.ensemblePerformance?.mse > 10) {
      validation.warnings.push('MSE élevé - Précision limitée');
    }
    
    if (results.ensemblePerformance?.r2 < 0.3) {
      validation.warnings.push('R² faible - Modèle peu explicatif');
    }
    
    validation.isValid = validation.warnings.length === 0;
    validation.metrics = results.ensemblePerformance || {};
    
    return validation;
  }

  /**
   * Récupère les métriques du pipeline
   */
  getPipelineMetrics() {
    return {
      ...this.pipelineMetrics,
      isInitialized: this.isInitialized,
      isTraining: this.isTraining,
      trainingProgress: this.trainingProgress,
      cacheSize: this.predictionCache.size,
      modelCacheSize: this.modelCache.size
    };
  }

  /**
   * Nettoie les caches
   */
  clearCaches() {
    this.predictionCache.clear();
    this.modelCache.clear();
  }
}

export default AdvancedPredictionPipeline;