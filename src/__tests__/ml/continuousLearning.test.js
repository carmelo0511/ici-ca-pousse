/**
 * Tests complets pour le système d'apprentissage continu
 */

import { 
  MLMetricsCollector, 
  MLValidationSystem, 
  FEEDBACK_TYPES,
  MLContinuousLearning 
} from '../../utils/ml/continuousLearning';

describe('MLMetricsCollector', () => {
  let collector;

  beforeEach(() => {
    collector = new MLMetricsCollector();
  });

  describe('collectPrediction', () => {
    it('should collect prediction with metadata', () => {
      const exerciseName = 'Bench Press';
      const prediction = { 
        nextWeight: 85, 
        confidence: 0.8, 
        modelUsed: 'ensemble' 
      };
      const features = { 
        current_weight: 80, 
        progression_1week: 0.02,
        user_level: 'intermediate' 
      };

      const predictionId = collector.collectPrediction(exerciseName, prediction, features, 'intermediate');

      expect(predictionId).toBeDefined();
      expect(collector.metrics.predictions).toHaveLength(1);
      
      const stored = collector.metrics.predictions[0];
      expect(stored.exerciseName).toBe(exerciseName);
      expect(stored.prediction.nextWeight).toBe(85);
      expect(stored.userLevel).toBe('intermediate');
      expect(stored.feedbackReceived).toBe(false);
    });

    it('should clean old metrics automatically', () => {
      // Ajouter des prédictions anciennes
      const oldTimestamp = Date.now() - (100 * 24 * 60 * 60 * 1000); // 100 jours
      collector.metrics.predictions.push({
        id: 'old-1',
        timestamp: oldTimestamp,
        exerciseName: 'Old Exercise'
      });

      collector.collectPrediction('New Exercise', { nextWeight: 80 }, {}, 'beginner');

      // Vérifier que les anciennes métriques ont été nettoyées
      expect(collector.metrics.predictions.some(p => p.id === 'old-1')).toBe(false);
      expect(collector.metrics.predictions).toHaveLength(1);
    });
  });

  describe('collectFeedback', () => {
    let predictionId;

    beforeEach(() => {
      predictionId = collector.collectPrediction(
        'Squat', 
        { nextWeight: 100 }, 
        { current_weight: 95 }, 
        'advanced'
      );
    });

    it('should collect actual performance feedback', () => {
      const feedbackData = { 
        actualWeight: 98, 
        actualReps: 5, 
        difficulty: 'moderate' 
      };

      const result = collector.collectFeedback(
        predictionId, 
        FEEDBACK_TYPES.ACTUAL_PERFORMANCE, 
        feedbackData
      );

      expect(result).toBe(true);
      expect(collector.metrics.userFeedbacks).toHaveLength(1);
      
      const feedback = collector.metrics.userFeedbacks[0];
      expect(feedback.type).toBe(FEEDBACK_TYPES.ACTUAL_PERFORMANCE);
      expect(feedback.data.actualWeight).toBe(98);
      expect(feedback.processed).toBe(false);
    });

    it('should calculate prediction accuracy from feedback', () => {
      const feedbackData = { actualWeight: 98 };
      
      collector.collectFeedback(
        predictionId, 
        FEEDBACK_TYPES.ACTUAL_PERFORMANCE, 
        feedbackData
      );

      const prediction = collector.metrics.predictions.find(p => p.id === predictionId);
      expect(prediction.feedbackReceived).toBe(true);
      expect(prediction.accuracyScore).toBeGreaterThan(0);
      expect(collector.metrics.accuracyScores).toHaveLength(1);
    });

    it('should handle invalid prediction ID gracefully', () => {
      const result = collector.collectFeedback('invalid-id', FEEDBACK_TYPES.ACTUAL_PERFORMANCE, {});
      expect(result).toBe(false);
    });
  });

  describe('updateModelPerformance', () => {
    it('should initialize performance metrics for new exercise', () => {
      collector.updateModelPerformance('Deadlift', 0.85);

      expect(collector.metrics.modelPerformance.Deadlift).toBeDefined();
      const performance = collector.metrics.modelPerformance.Deadlift;
      expect(performance.totalPredictions).toBe(1);
      expect(performance.accurateCount).toBe(1);
      expect(performance.averageAccuracy).toBe(0.85);
    });

    it('should update existing performance metrics', () => {
      collector.updateModelPerformance('Deadlift', 0.9);
      collector.updateModelPerformance('Deadlift', 0.7);

      const performance = collector.metrics.modelPerformance.Deadlift;
      expect(performance.totalPredictions).toBe(2);
      expect(performance.accurateCount).toBe(1); // Seuil 0.8
      expect(performance.averageAccuracy).toBe(0.8);
    });
  });

  describe('detectAccuracyDrop', () => {
    it('should detect significant accuracy drop', () => {
      // Ajouter des scores d'accuracy avec une baisse
      for (let i = 0; i < 10; i++) {
        collector.metrics.accuracyScores.push({ accuracyScore: 0.9, timestamp: Date.now() });
      }
      for (let i = 0; i < 10; i++) {
        collector.metrics.accuracyScores.push({ accuracyScore: 0.7, timestamp: Date.now() });
      }

      const hasDrop = collector.detectAccuracyDrop();
      expect(hasDrop).toBe(true);
    });

    it('should not detect drop with insufficient data', () => {
      for (let i = 0; i < 5; i++) {
        collector.metrics.accuracyScores.push({ accuracyScore: 0.8, timestamp: Date.now() });
      }

      const hasDrop = collector.detectAccuracyDrop();
      expect(hasDrop).toBe(false);
    });
  });

  describe('triggerModelRecalibration', () => {
    it('should handle insufficient data gracefully', async () => {
      const reasons = { timeInterval: true };
      const result = await collector.triggerModelRecalibration(reasons);

      expect(result.status).toBe('skipped_insufficient_data');
    });

    it('should complete recalibration with sufficient data', async () => {
      // Préparer des données suffisantes
      for (let i = 0; i < 10; i++) {
        const predId = collector.collectPrediction(
          'Test Exercise', 
          { nextWeight: 80 + i }, 
          { current_weight: 75 + i }, 
          'intermediate'
        );
        
        collector.collectFeedback(
          predId, 
          FEEDBACK_TYPES.ACTUAL_PERFORMANCE, 
          { actualWeight: 79 + i }
        );
      }

      const reasons = { sufficientFeedback: true };
      const result = await collector.triggerModelRecalibration(reasons);

      expect(result.status).toBe('completed');
      expect(result.improvement).toBeDefined();
      expect(collector.feedbackBuffer).toHaveLength(0); // Buffer nettoyé
    });
  });

  describe('getMetricsReport', () => {
    it('should generate comprehensive metrics report', () => {
      // Ajouter quelques prédictions et feedbacks
      const predId1 = collector.collectPrediction('Exercise1', { nextWeight: 80 }, {}, 'beginner');
      collector.collectPrediction('Exercise2', { nextWeight: 90 }, {}, 'advanced');
      
      collector.collectFeedback(predId1, FEEDBACK_TYPES.ACTUAL_PERFORMANCE, { actualWeight: 78 });

      const report = collector.getMetricsReport();

      expect(report.summary).toBeDefined();
      expect(report.summary.totalPredictions).toBe(2);
      expect(report.summary.feedbackRate).toBe(50); // 1 sur 2
      expect(report.modelPerformance).toBeDefined();
      expect(report.recentCalibrations).toBeInstanceOf(Array);
    });
  });
});

describe('MLValidationSystem', () => {
  let validator;
  
  beforeEach(() => {
    validator = new MLValidationSystem();
  });

  describe('validatePrediction', () => {
    it('should validate correct prediction', () => {
      const prediction = { nextWeight: 82, confidence: 0.8 };
      const features = { current_weight: 80, user_level: 'intermediate' };
      const history = [
        { weight: 75, date: '2024-01-01' },
        { weight: 77, date: '2024-01-08' },
        { weight: 80, date: '2024-01-15' }
      ];

      const result = validator.validatePrediction(prediction, features, history);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
      expect(result.qualityScore).toBeGreaterThan(0.5);
    });

    it('should flag excessive weight increase', () => {
      const prediction = { nextWeight: 85, confidence: 0.8 }; // +5kg
      const features = { current_weight: 80, user_level: 'intermediate' };
      const history = [];

      const result = validator.validatePrediction(prediction, features, history);

      expect(result.isValid).toBe(false);
      expect(result.warnings.some(w => w.includes('trop importante'))).toBe(true);
      expect(result.adjustments.some(a => a.includes('Limiter'))).toBe(true);
    });

    it('should flag negative weight progression', () => {
      const prediction = { nextWeight: 75, confidence: 0.7 }; // -5kg
      const features = { current_weight: 80, user_level: 'advanced' };
      const history = [];

      const result = validator.validatePrediction(prediction, features, history);

      expect(result.isValid).toBe(false);
      expect(result.warnings.some(w => w.includes('régression'))).toBe(true);
    });

    it('should adjust confidence based on warnings', () => {
      const prediction = { nextWeight: 85, confidence: 0.8 };
      const features = { current_weight: 80, user_level: 'beginner' };
      const history = [];

      const result = validator.validatePrediction(prediction, features, history);

      expect(result.confidence).toBeLessThan(0.8); // Confiance réduite
    });
  });

  describe('validateUserLevel', () => {
    it('should validate progression for beginner', () => {
      const prediction = { nextWeight: 82 }; // 2.5% augmentation
      const features = { current_weight: 80, user_level: 'beginner' };

      const result = validator.validateUserLevel(prediction, features, []);

      expect(result.valid).toBe(true);
      expect(result.score).toBe(1.0);
    });

    it('should flag excessive progression for advanced user', () => {
      const prediction = { nextWeight: 84 }; // 5% augmentation
      const features = { current_weight: 80, user_level: 'advanced' };

      const result = validator.validateUserLevel(prediction, features, []);

      expect(result.valid).toBe(false);
      expect(result.warning).toContain('advanced');
    });
  });

  describe('validateHistoricalConsistency', () => {
    it('should validate with insufficient history', () => {
      const prediction = { nextWeight: 85 };
      const features = { current_weight: 80 };
      const history = [{ weight: 80 }]; // Pas assez d'historique

      const result = validator.validateHistoricalConsistency(prediction, features, history);

      expect(result.valid).toBe(true);
      expect(result.score).toBe(0.6); // Score neutre
    });

    it('should flag inconsistent prediction with high variance', () => {
      const prediction = { nextWeight: 90 }; // Grande variation
      const features = { current_weight: 80 };
      const history = [
        { weight: 75 }, 
        { weight: 82 }, 
        { weight: 78 }, 
        { weight: 85 }, 
        { weight: 80 }
      ]; // Historique avec haute variance

      const result = validator.validateHistoricalConsistency(prediction, features, history);

      expect(result.valid).toBe(false);
      expect(result.warning).toContain('incohérente');
    });
  });
});

describe('MLContinuousLearning API', () => {
  beforeEach(() => {
    // Reset des instances globales pour les tests
    MLContinuousLearning.getMetricsReport(); // Initialise si nécessaire
  });

  it('should track predictions via API', () => {
    const predictionId = MLContinuousLearning.trackPrediction(
      'API Test Exercise',
      { nextWeight: 100, confidence: 0.9 },
      { current_weight: 95, user_level: 'intermediate' },
      'intermediate'
    );

    expect(predictionId).toBeDefined();
    expect(typeof predictionId).toBe('string');
  });

  it('should provide feedback via API', () => {
    const predictionId = MLContinuousLearning.trackPrediction(
      'Feedback Test',
      { nextWeight: 85 },
      { current_weight: 80 },
      'beginner'
    );

    const result = MLContinuousLearning.provideFeedback(
      predictionId,
      FEEDBACK_TYPES.USER_SATISFACTION,
      { rating: 4, comments: 'Good prediction' }
    );

    expect(result).toBe(true);
  });

  it('should validate predictions via API', () => {
    const validation = MLContinuousLearning.validatePrediction(
      { nextWeight: 82, confidence: 0.8 },
      { current_weight: 80, user_level: 'intermediate' },
      [{ weight: 78 }, { weight: 80 }]
    );

    expect(validation).toBeDefined();
    expect(validation.isValid).toBeDefined();
    expect(validation.confidence).toBeDefined();
    expect(validation.warnings).toBeInstanceOf(Array);
    expect(validation.qualityScore).toBeGreaterThanOrEqual(0);
  });

  it('should generate metrics report via API', () => {
    const report = MLContinuousLearning.getMetricsReport();

    expect(report).toBeDefined();
    expect(report.summary).toBeDefined();
    expect(report.summary.totalPredictions).toBeGreaterThanOrEqual(0);
    expect(report.summary.feedbackRate).toBeGreaterThanOrEqual(0);
    expect(report.modelPerformance).toBeDefined();
  });
});

describe('Intégration complète', () => {
  it('should handle complete prediction lifecycle', () => {
    // 1. Tracker une prédiction
    const predictionId = MLContinuousLearning.trackPrediction(
      'Complete Test',
      { nextWeight: 86.25, confidence: 0.85 }, // Progression plus conservative
      { 
        current_weight: 85, 
        user_level: 'intermediate',
        progression_1week: 0.015, // 1.5% progression plus réaliste
        progression_2weeks: 0.025
      },
      'intermediate'
    );

    // 2. Valider la prédiction
    const validation = MLContinuousLearning.validatePrediction(
      { nextWeight: 86.25, confidence: 0.85 }, // Progression plus conservative
      { current_weight: 85, user_level: 'intermediate' },
      [
        { weight: 80 }, 
        { weight: 82 }, 
        { weight: 85 }
      ]
    );

    expect(validation.isValid).toBe(true);

    // 3. Fournir feedback de performance réelle
    const feedbackResult = MLContinuousLearning.provideFeedback(
      predictionId,
      FEEDBACK_TYPES.ACTUAL_PERFORMANCE,
      { 
        actualWeight: 87, 
        actualReps: 5, 
        difficulty: 'appropriate' 
      }
    );

    expect(feedbackResult).toBe(true);

    // 4. Vérifier que le rapport reflète les données
    const report = MLContinuousLearning.getMetricsReport();
    expect(report.summary.totalPredictions).toBeGreaterThan(0);

    // 5. Ajouter feedback de satisfaction
    const satisfactionResult = MLContinuousLearning.provideFeedback(
      predictionId,
      FEEDBACK_TYPES.USER_SATISFACTION,
      { rating: 5, comments: 'Excellent prediction!' }
    );

    expect(satisfactionResult).toBe(true);
  });

  it('should handle validation failures gracefully', () => {
    const validation = MLContinuousLearning.validatePrediction(
      { nextWeight: 120, confidence: 0.9 }, // Augmentation excessive
      { current_weight: 80, user_level: 'beginner' },
      [{ weight: 78 }, { weight: 80 }]
    );

    expect(validation.isValid).toBe(false);
    expect(validation.warnings.length).toBeGreaterThan(0);
    expect(validation.adjustments.length).toBeGreaterThan(0);
    expect(validation.confidence).toBeLessThan(0.9); // Confiance réduite
  });
});

// Tests de performance et edge cases

describe('Performance et Edge Cases', () => {
  let collector;

  beforeEach(() => {
    collector = new MLMetricsCollector();
  });

  it('should handle large number of predictions efficiently', () => {
    const startTime = Date.now();
    
    // Ajouter 1000 prédictions
    for (let i = 0; i < 1000; i++) {
      collector.collectPrediction(
        `Exercise ${i % 10}`, // 10 exercices différents
        { nextWeight: 80 + (i % 20) },
        { current_weight: 75 + (i % 20) },
        ['beginner', 'intermediate', 'advanced'][i % 3]
      );
    }

    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(1000); // Moins d'1 seconde

    expect(collector.metrics.predictions).toHaveLength(1000);
  });

  it('should maintain data integrity during concurrent operations', () => {
    const predictions = [];
    
    // Simuler des opérations concurrentes
    for (let i = 0; i < 100; i++) {
      const predId = collector.collectPrediction(
        'Concurrent Test',
        { nextWeight: 80 + i },
        { current_weight: 75 + i },
        'intermediate'
      );
      predictions.push(predId);
      
      // Ajouter feedback immédiatement
      if (i % 2 === 0) {
        collector.collectFeedback(
          predId,
          FEEDBACK_TYPES.ACTUAL_PERFORMANCE,
          { actualWeight: 79 + i }
        );
      }
    }

    expect(collector.metrics.predictions).toHaveLength(100);
    expect(collector.metrics.userFeedbacks).toHaveLength(50);
    
    // Vérifier que tous les IDs sont uniques
    const ids = collector.metrics.predictions.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should handle edge cases in trend calculation', () => {
    const validator = new MLValidationSystem();
    
    // Tester avec des valeurs nulles/undefined
    expect(validator.calculateTrend([])).toBe(0);
    expect(validator.calculateTrend([5])).toBe(0);
    expect(validator.calculateVariance([])).toBe(0);
    expect(validator.calculateVariance([5])).toBe(0);
    
    // Tester avec des valeurs identiques
    expect(validator.calculateVariance([5, 5, 5, 5])).toBe(0);
    
    // Tester avec des valeurs très grandes
    const largeValues = [1000000, 1000001, 1000002];
    expect(validator.calculateTrend(largeValues)).toBeCloseTo(1, 5);
  });

  it('should handle memory efficiently with old data cleanup', () => {
    // Simuler 6 mois de données
    const sixMonthsAgo = Date.now() - (180 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = Date.now() - (60 * 24 * 60 * 60 * 1000); // Dans les 90 jours
    
    // Ajouter des données anciennes (seront supprimées - plus de 90 jours)
    collector.metrics.predictions.push({
      id: 'old-data',
      timestamp: sixMonthsAgo,
      exerciseName: 'Old Exercise'
    });
    
    // Ajouter des données récentes (seront conservées - moins de 90 jours)
    collector.metrics.predictions.push({
      id: 'recent-data',
      timestamp: twoMonthsAgo,
      exerciseName: 'Recent Exercise'
    });

    // Déclencher le nettoyage
    collector.collectPrediction('New Exercise', { nextWeight: 80 }, {}, 'beginner');

    // Vérifier le nettoyage
    expect(collector.metrics.predictions.some(p => p.id === 'old-data')).toBe(false);
    expect(collector.metrics.predictions.some(p => p.id === 'recent-data')).toBe(true);
    expect(collector.metrics.predictions.some(p => p.exerciseName === 'New Exercise')).toBe(true);
  });
});