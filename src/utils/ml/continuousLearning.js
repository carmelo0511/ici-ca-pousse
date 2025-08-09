/**
 * Système d'apprentissage continu pour améliorer les modèles ML en temps réel
 * Collecte les feedbacks utilisateur et recalibrage automatique des modèles
 */

import { AdvancedPredictionPipeline } from './advancedPredictionPipeline';
import { MUSCULATION_CONSTRAINTS } from './musculationConstraints';

/**
 * Types de feedback utilisateur
 */
export const FEEDBACK_TYPES = {
  PREDICTION_ACCURACY: 'prediction_accuracy',
  DIFFICULTY_RATING: 'difficulty_rating',
  ACTUAL_PERFORMANCE: 'actual_performance',
  USER_SATISFACTION: 'user_satisfaction'
};

/**
 * Système de métrics en temps réel pour l'apprentissage continu
 */
export class MLMetricsCollector {
  constructor() {
    this.metrics = {
      predictions: [],
      accuracyScores: [],
      userFeedbacks: [],
      modelPerformance: {},
      calibrationHistory: []
    };
    
    this.accuracyThreshold = 0.8; // Seuil pour déclencher recalibrage
    this.feedbackBuffer = []; // Buffer pour accumuler les feedbacks
    this.lastRecalibration = Date.now();
    this.recalibrationInterval = 7 * 24 * 60 * 60 * 1000; // 7 jours
  }

  /**
   * Collecte une prédiction avec métadonnées pour suivi
   */
  collectPrediction(exerciseName, prediction, features, userLevel) {
    const predictionRecord = {
      id: this.generateId(),
      timestamp: Date.now(),
      exerciseName,
      prediction: {
        ...prediction,
        features: this.extractKeyFeatures(features)
      },
      userLevel,
      actualOutcome: null, // Sera rempli par le feedback
      accuracyScore: null,
      feedbackReceived: false
    };

    this.metrics.predictions.push(predictionRecord);
    
    // Nettoyer les anciennes prédictions (garder 90 jours)
    this.cleanOldMetrics();
    
    return predictionRecord.id;
  }

  /**
   * Collecte le feedback utilisateur sur une prédiction
   */
  collectFeedback(predictionId, feedbackType, feedbackData) {
    const prediction = this.metrics.predictions.find(p => p.id === predictionId);
    
    if (!prediction) {
      return false;
    }

    const feedback = {
      id: this.generateId(),
      timestamp: Date.now(),
      predictionId,
      type: feedbackType,
      data: feedbackData,
      processed: false
    };

    this.metrics.userFeedbacks.push(feedback);
    this.feedbackBuffer.push(feedback);

    // Calculer la précision si c'est un feedback de performance réelle
    if (feedbackType === FEEDBACK_TYPES.ACTUAL_PERFORMANCE) {
      this.calculatePredictionAccuracy(prediction, feedbackData);
    }

    // Déclencher recalibrage si nécessaire
    this.evaluateRecalibrationNeed();
    
    return true;
  }

  /**
   * Calcule la précision d'une prédiction basée sur le résultat réel
   */
  calculatePredictionAccuracy(prediction, actualData) {
    const predicted = prediction.prediction.nextWeight;
    const actual = actualData.actualWeight;
    
    if (!predicted || !actual) return;

    // Calculer l'erreur relative
    const relativeError = Math.abs(predicted - actual) / Math.max(actual, predicted);
    const accuracyScore = Math.max(0, 1 - relativeError);
    
    prediction.actualOutcome = actualData;
    prediction.accuracyScore = accuracyScore;
    prediction.feedbackReceived = true;
    
    this.metrics.accuracyScores.push({
      timestamp: Date.now(),
      exerciseName: prediction.exerciseName,
      userLevel: prediction.userLevel,
      accuracyScore,
      relativeError,
      predicted,
      actual
    });

    // Mettre à jour les métriques de performance du modèle
    this.updateModelPerformance(prediction.exerciseName, accuracyScore);
  }

  /**
   * Met à jour les métriques de performance par exercice
   */
  updateModelPerformance(exerciseName, accuracyScore) {
    if (!this.metrics.modelPerformance[exerciseName]) {
      this.metrics.modelPerformance[exerciseName] = {
        totalPredictions: 0,
        accurateCount: 0,
        averageAccuracy: 0,
        accuracyHistory: [],
        lastUpdate: Date.now()
      };
    }

    const performance = this.metrics.modelPerformance[exerciseName];
    performance.totalPredictions++;
    performance.accuracyHistory.push(accuracyScore);
    
    if (accuracyScore >= this.accuracyThreshold) {
      performance.accurateCount++;
    }
    
    // Calculer la précision moyenne (dernières 20 prédictions)
    const recentAccuracy = performance.accuracyHistory.slice(-20);
    performance.averageAccuracy = recentAccuracy.reduce((sum, acc) => sum + acc, 0) / recentAccuracy.length;
    performance.lastUpdate = Date.now();
  }

  /**
   * Évalue si un recalibrage des modèles est nécessaire
   */
  evaluateRecalibrationNeed() {
    const now = Date.now();
    const timeSinceLastRecalibration = now - this.lastRecalibration;
    
    // Conditions de recalibrage
    const conditions = {
      timeInterval: timeSinceLastRecalibration > this.recalibrationInterval,
      accuracyDrop: this.detectAccuracyDrop(),
      sufficientFeedback: this.feedbackBuffer.length >= 10,
      userComplaint: this.detectUserComplaint()
    };

    const shouldRecalibrate = conditions.timeInterval || 
                             (conditions.accuracyDrop && conditions.sufficientFeedback) ||
                             conditions.userComplaint;

    if (shouldRecalibrate) {
      this.triggerModelRecalibration(conditions);
    }

    return shouldRecalibrate;
  }

  /**
   * Détecte une baisse de précision significative
   */
  detectAccuracyDrop() {
    const recentAccuracy = this.metrics.accuracyScores.slice(-20);
    if (recentAccuracy.length < 10) return false;

    const recent = recentAccuracy.slice(-10);
    const previous = recentAccuracy.slice(-20, -10);
    
    const recentAvg = recent.reduce((sum, a) => sum + a.accuracyScore, 0) / recent.length;
    const previousAvg = previous.reduce((sum, a) => sum + a.accuracyScore, 0) / previous.length;
    
    return recentAvg < previousAvg - 0.1; // Baisse de 10%
  }

  /**
   * Détecte des plaintes utilisateur récurrentes
   */
  detectUserComplaint() {
    const recentFeedbacks = this.metrics.userFeedbacks.slice(-10);
    const negativeCount = recentFeedbacks.filter(f => 
      f.type === FEEDBACK_TYPES.USER_SATISFACTION && f.data.rating < 3
    ).length;
    
    return negativeCount >= 3; // 3 ou plus feedbacks négatifs
  }

  /**
   * Déclenche le recalibrage des modèles
   */
  async triggerModelRecalibration(reasons) {
    
    const calibrationRecord = {
      timestamp: Date.now(),
      reasons,
      feedbackCount: this.feedbackBuffer.length,
      accuracyBefore: this.getAverageAccuracy(),
      status: 'in_progress'
    };

    try {
      // Extraire les données d'apprentissage des feedbacks
      const trainingData = this.extractTrainingDataFromFeedback();
      
      if (trainingData.length < 5) {
        calibrationRecord.status = 'skipped_insufficient_data';
        return calibrationRecord;
      }

      // Créer un nouveau pipeline pour recalibrage
      const recalibrationPipeline = new AdvancedPredictionPipeline({
        minDataPoints: 3,
        modelConfig: this.generateOptimalModelConfig(trainingData)
      });

      // Effectuer l'entraînement avec les nouvelles données
      await this.performModelRetraining(recalibrationPipeline, trainingData);
      
      calibrationRecord.status = 'completed';
      calibrationRecord.accuracyAfter = this.getAverageAccuracy();
      calibrationRecord.improvement = calibrationRecord.accuracyAfter - calibrationRecord.accuracyBefore;
      
      // Marquer les feedbacks comme traités
      this.feedbackBuffer.forEach(f => f.processed = true);
      this.feedbackBuffer = [];
      this.lastRecalibration = Date.now();
      

    } catch (error) {
      calibrationRecord.status = 'failed';
      calibrationRecord.error = error.message;
    }

    this.metrics.calibrationHistory.push(calibrationRecord);
    return calibrationRecord;
  }

  /**
   * Extrait les données d'entraînement des feedbacks
   */
  extractTrainingDataFromFeedback() {
    return this.metrics.predictions
      .filter(p => p.feedbackReceived && p.actualOutcome)
      .map(p => ({
        features: p.prediction.features,
        target: p.actualOutcome.actualWeight,
        exerciseName: p.exerciseName,
        userLevel: p.userLevel,
        weight: 1.0 // Poids égal pour tous les échantillons
      }));
  }

  /**
   * Génère une configuration optimale pour les modèles
   */
  generateOptimalModelConfig(trainingData) {
    const dataSize = trainingData.length;
    
    return {
      linear: {
        learningRate: dataSize > 50 ? 0.005 : 0.01,
        regularization: dataSize > 100 ? 'l2' : 'l1',
        maxIterations: Math.min(1000, dataSize * 10)
      },
      forest: {
        nTrees: Math.max(5, Math.min(20, Math.floor(dataSize / 5))),
        maxDepth: dataSize > 50 ? 8 : 6,
        bootstrap: true
      },
      neural: {
        epochs: Math.min(300, dataSize * 2),
        hiddenLayers: dataSize > 100 ? [20, 15, 10] : [15, 10],
        dropout: dataSize > 50 ? 0.3 : 0.2
      }
    };
  }

  /**
   * Effectue le réentraînement des modèles
   */
  async performModelRetraining(pipeline, trainingData) {
    // Simuler le réentraînement avec validation croisée
    const validationResults = await this.performCrossValidation(trainingData);
    
    // Mettre à jour les poids d'ensemble basés sur les résultats
    const newWeights = this.calculateOptimalEnsembleWeights(validationResults);
    
    // Sauvegarder les nouveaux paramètres
    this.saveModelParameters(newWeights, validationResults);
    
    return validationResults;
  }

  /**
   * Effectue la validation croisée sur les nouvelles données
   */
  async performCrossValidation(data, folds = 5) {
    const results = {
      linear: { mse: 0, r2: 0 },
      forest: { mse: 0, r2: 0 },
      neural: { mse: 0, r2: 0 }
    };

    // Simuler validation croisée
    for (let fold = 0; fold < folds; fold++) {
      const testSize = Math.floor(data.length / folds);
      const testStart = fold * testSize;
      const testEnd = Math.min(testStart + testSize, data.length);
      
      const testData = data.slice(testStart, testEnd);
      const trainData = [...data.slice(0, testStart), ...data.slice(testEnd)];
      
      if (testData.length === 0 || trainData.length === 0) continue;
      
      // Simuler l'entraînement et test pour chaque modèle
      Object.keys(results).forEach(modelType => {
        const modelResults = this.simulateModelTraining(trainData, testData, modelType);
        results[modelType].mse += modelResults.mse / folds;
        results[modelType].r2 += modelResults.r2 / folds;
      });
    }

    return results;
  }

  /**
   * Simule l'entraînement d'un modèle (pour MVP)
   */
  simulateModelTraining(trainData, testData, modelType) {
    // Simulation basée sur la complexité du modèle et taille des données
    const complexity = {
      linear: 0.1,
      forest: 0.05,
      neural: 0.03
    };

    const baseAccuracy = 0.85;
    const dataBonus = Math.min(0.1, trainData.length / 100);
    const randomFactor = (Math.random() - 0.5) * 0.1;
    
    const modelAccuracy = baseAccuracy + dataBonus - complexity[modelType] + randomFactor;
    const mse = (1 - modelAccuracy) * 10; // MSE simulé
    const r2 = Math.max(0, modelAccuracy); // R² simulé
    
    return { mse, r2 };
  }

  /**
   * Calcule les poids optimaux pour l'ensemble
   */
  calculateOptimalEnsembleWeights(validationResults) {
    const weights = {};
    let totalInverseError = 0;
    
    // Calculer les poids basés sur les performances inverses
    Object.entries(validationResults).forEach(([model, results]) => {
      const inverseError = 1 / (results.mse + 0.01); // Éviter division par zéro
      weights[model] = inverseError;
      totalInverseError += inverseError;
    });
    
    // Normaliser les poids
    Object.keys(weights).forEach(model => {
      weights[model] = weights[model] / totalInverseError;
    });
    
    return weights;
  }

  /**
   * Sauvegarde les paramètres du modèle
   */
  saveModelParameters(weights, validationResults) {
    const modelState = {
      timestamp: Date.now(),
      ensembleWeights: weights,
      validationResults,
      version: this.generateModelVersion()
    };
    
    // En production, ceci serait sauvegardé dans une base de données
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ml_model_state', JSON.stringify(modelState));
    }
    
  }

  // Méthodes utilitaires

  extractKeyFeatures(features) {
    // Extraire les features les plus importantes pour le suivi
    return {
      progression_1week: features.progression_1week,
      progression_2weeks: features.progression_2weeks,
      volume_trend: features.volume_trend,
      consistency_score: features.consistency_score,
      user_level: features.user_level
    };
  }

  getAverageAccuracy() {
    if (this.metrics.accuracyScores.length === 0) return 0;
    const recent = this.metrics.accuracyScores.slice(-50);
    return recent.reduce((sum, a) => sum + a.accuracyScore, 0) / recent.length;
  }

  cleanOldMetrics() {
    const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
    
    this.metrics.predictions = this.metrics.predictions.filter(p => p.timestamp > ninetyDaysAgo);
    this.metrics.accuracyScores = this.metrics.accuracyScores.filter(a => a.timestamp > ninetyDaysAgo);
    this.metrics.userFeedbacks = this.metrics.userFeedbacks.filter(f => f.timestamp > ninetyDaysAgo);
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  generateModelVersion() {
    return `v${Date.now()}.${Math.random().toString(36).substr(2, 4)}`;
  }

  /**
   * Récupère un rapport détaillé des métriques
   */
  getMetricsReport() {
    const totalPredictions = this.metrics.predictions.length;
    const feedbackRate = totalPredictions > 0 ? 
      this.metrics.predictions.filter(p => p.feedbackReceived).length / totalPredictions : 0;
    
    return {
      summary: {
        totalPredictions,
        feedbackRate: Math.round(feedbackRate * 100),
        averageAccuracy: Math.round(this.getAverageAccuracy() * 100),
        lastRecalibration: new Date(this.lastRecalibration).toISOString(),
        calibrationCount: this.metrics.calibrationHistory.length
      },
      modelPerformance: this.metrics.modelPerformance,
      recentCalibrations: this.metrics.calibrationHistory.slice(-5)
    };
  }
}

/**
 * Système de validation pour assurer la qualité des prédictions
 */
export class MLValidationSystem {
  constructor() {
    this.validationRules = [
      this.validateWeightConstraints,
      this.validateProgressionRate,
      this.validateUserLevel,
      this.validateHistoricalConsistency
    ];
    
    this.qualityThresholds = {
      minConfidence: 0.6,
      maxWeightIncrease: MUSCULATION_CONSTRAINTS.MAX_INCREMENT,
      minWeightIncrease: MUSCULATION_CONSTRAINTS.MIN_INCREMENT,
      maxProgressionRate: 0.1 // 10% par semaine max
    };
  }

  /**
   * Valide une prédiction avant de la présenter à l'utilisateur
   */
  validatePrediction(prediction, features, exerciseHistory) {
    const validationResults = {
      isValid: true,
      confidence: prediction.confidence || 0.7,
      warnings: [],
      adjustments: [],
      qualityScore: 0
    };

    // Appliquer toutes les règles de validation
    this.validationRules.forEach(rule => {
      const result = rule.call(this, prediction, features, exerciseHistory);
      if (!result.valid) {
        validationResults.isValid = false;
        validationResults.warnings.push(result.warning);
        
        if (result.adjustment) {
          validationResults.adjustments.push(result.adjustment);
        }
      }
      validationResults.qualityScore += result.score || 0;
    });

    // Normaliser le score de qualité
    validationResults.qualityScore = Math.min(1, validationResults.qualityScore / this.validationRules.length);
    
    // Ajuster la confiance basée sur la validation
    if (validationResults.warnings.length > 0) {
      validationResults.confidence *= (1 - validationResults.warnings.length * 0.1);
    }

    return validationResults;
  }

  /**
   * Valide les contraintes de poids
   */
  validateWeightConstraints(prediction, features, history) {
    const currentWeight = features.current_weight || 0;
    const nextWeight = prediction.nextWeight || 0;
    const increase = nextWeight - currentWeight;

    if (increase < 0) {
      return {
        valid: false,
        warning: 'Prédiction suggère une régression de poids',
        adjustment: 'Maintenir le poids actuel',
        score: 0.2
      };
    }

    if (increase > this.qualityThresholds.maxWeightIncrease) {
      return {
        valid: false,
        warning: `Augmentation de poids trop importante: ${increase}kg`,
        adjustment: `Limiter à ${this.qualityThresholds.maxWeightIncrease}kg`,
        score: 0.3
      };
    }

    if (increase > 0 && increase < this.qualityThresholds.minWeightIncrease) {
      return {
        valid: true,
        warning: 'Augmentation très faible détectée',
        score: 0.7
      };
    }

    return { valid: true, score: 1.0 };
  }

  /**
   * Valide le taux de progression
   */
  validateProgressionRate(prediction, features, history) {
    const recentProgression = features.progression_2weeks || 0;
    const predictedProgression = (prediction.nextWeight - features.current_weight) / features.current_weight;

    if (Math.abs(predictedProgression) > this.qualityThresholds.maxProgressionRate) {
      return {
        valid: false,
        warning: 'Taux de progression irréaliste',
        adjustment: 'Progression plus graduelle recommandée',
        score: 0.4
      };
    }

    // Vérifier cohérence avec l'historique
    const consistencyScore = 1 - Math.abs(predictedProgression - recentProgression);
    
    return {
      valid: true,
      score: Math.max(0.5, consistencyScore)
    };
  }

  /**
   * Valide selon le niveau utilisateur
   */
  validateUserLevel(prediction, features, history) {
    const userLevel = features.user_level || 'intermediate';
    const progressionRate = (prediction.nextWeight - features.current_weight) / features.current_weight;
    
    const levelLimits = {
      beginner: 0.08, // 8% max
      intermediate: 0.05, // 5% max
      advanced: 0.03 // 3% max
    };

    const limit = levelLimits[userLevel] || levelLimits.intermediate;
    
    if (progressionRate > limit) {
      return {
        valid: false,
        warning: `Progression trop rapide pour niveau ${userLevel}`,
        adjustment: `Réduire à ${(limit * 100).toFixed(1)}% max`,
        score: 0.5
      };
    }

    return { valid: true, score: 1.0 };
  }

  /**
   * Valide la cohérence avec l'historique
   */
  validateHistoricalConsistency(prediction, features, history) {
    if (!history || history.length < 3) {
      return { valid: true, score: 0.6 }; // Score neutre si peu d'historique
    }

    const recentWeights = history.slice(-5).map(h => h.weight || h.maxWeight);
    const weightVariance = this.calculateVariance(recentWeights);
    const weightTrend = this.calculateTrend(recentWeights);

    // Si forte variance récente, être plus conservateur
    if (weightVariance > 2) {
      const conservativePrediction = features.current_weight + (weightTrend * 0.5);
      const actualPrediction = prediction.nextWeight;
      
      if (Math.abs(actualPrediction - conservativePrediction) > 1) {
        return {
          valid: false,
          warning: 'Prédiction incohérente avec variabilité récente',
          adjustment: 'Progression plus conservative recommandée',
          score: 0.4
        };
      }
    }

    return { valid: true, score: 0.9 };
  }

  // Méthodes utilitaires

  calculateVariance(values) {
    if (values.length < 2) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
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
}

/**
 * Instance globale du système d'apprentissage continu
 */
export const continuousLearningSystem = new MLMetricsCollector();

/**
 * Instance globale du système de validation
 */
export const validationSystem = new MLValidationSystem();

/**
 * API simplifiée pour intégration dans l'application
 */
export const MLContinuousLearning = {
  // Enregistrer une prédiction
  trackPrediction: (exerciseName, prediction, features, userLevel) => 
    continuousLearningSystem.collectPrediction(exerciseName, prediction, features, userLevel),
  
  // Enregistrer un feedback utilisateur
  provideFeedback: (predictionId, type, data) => 
    continuousLearningSystem.collectFeedback(predictionId, type, data),
  
  // Valider une prédiction
  validatePrediction: (prediction, features, history) => 
    validationSystem.validatePrediction(prediction, features, history),
  
  // Obtenir le rapport des métriques
  getMetricsReport: () => continuousLearningSystem.getMetricsReport(),
  
  // Déclencher recalibrage manuel
  triggerRecalibration: () => continuousLearningSystem.evaluateRecalibrationNeed()
};

export default MLContinuousLearning;