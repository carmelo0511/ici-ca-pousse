/**
 * Tests complets pour le pipeline ML principal
 */

import { AdvancedPredictionPipeline } from '../../utils/ml/advancedPredictionPipeline';
import { FeatureEngineer } from '../../utils/ml/featureEngineering';
import { EnsembleModel } from '../../utils/ml/models/ensembleModel';
import { MUSCULATION_CONSTRAINTS } from '../../utils/ml/musculationConstraints';

// Mock des modèles pour tests plus rapides
jest.mock('../../utils/ml/models/linearRegression', () => ({
  AdvancedLinearRegression: jest.fn().mockImplementation(() => ({
    fit: jest.fn(),
    predict: jest.fn((features) => features.current_weight * 1.02),
    getCoefficients: jest.fn(() => ({ weight: 1.02 })),
    evaluate: jest.fn(() => ({ mse: 0.5, r2: 0.85 }))
  }))
}));

jest.mock('../../utils/ml/models/randomForest', () => ({
  RandomForestModel: jest.fn().mockImplementation(() => ({
    fit: jest.fn(),
    predict: jest.fn((features) => features.current_weight * 1.025),
    getFeatureImportance: jest.fn(() => ({ current_weight: 0.4, progression_1week: 0.3 })),
    evaluate: jest.fn(() => ({ mse: 0.4, r2: 0.88 }))
  }))
}));

jest.mock('../../utils/ml/models/neuralNetwork', () => ({
  NeuralNetworkModel: jest.fn().mockImplementation(() => ({
    fit: jest.fn(),
    predict: jest.fn((features) => features.current_weight * 1.03),
    getWeights: jest.fn(() => [1.0, 0.5, -0.2]),
    evaluate: jest.fn(() => ({ mse: 0.6, r2: 0.82 }))
  }))
}));

describe('AdvancedPredictionPipeline', () => {
  let pipeline;
  let mockWorkouts;
  let mockUser;

  beforeEach(() => {
    pipeline = new AdvancedPredictionPipeline({
      minDataPoints: 3,
      modelConfig: {
        linear: { learningRate: 0.01 },
        forest: { nTrees: 10 },
        neural: { epochs: 100 }
      }
    });

    mockWorkouts = [
      {
        id: '1',
        date: '2024-01-01',
        exercises: [
          {
            name: 'Bench Press',
            sets: [
              { weight: 80, reps: 8 },
              { weight: 80, reps: 7 },
              { weight: 80, reps: 6 }
            ]
          },
          {
            name: 'Squat',
            sets: [
              { weight: 100, reps: 5 },
              { weight: 100, reps: 5 },
              { weight: 95, reps: 6 }
            ]
          }
        ]
      },
      {
        id: '2',
        date: '2024-01-08',
        exercises: [
          {
            name: 'Bench Press',
            sets: [
              { weight: 82, reps: 8 },
              { weight: 82, reps: 7 },
              { weight: 80, reps: 8 }
            ]
          }
        ]
      },
      {
        id: '3',
        date: '2024-01-15',
        exercises: [
          {
            name: 'Bench Press',
            sets: [
              { weight: 85, reps: 6 },
              { weight: 85, reps: 5 },
              { weight: 82, reps: 7 }
            ]
          }
        ]
      }
    ];

    mockUser = {
      level: 'intermediate',
      experienceMonths: 24,
      preferences: { focusAreas: ['strength'] }
    };
  });

  describe('initialize', () => {
    it('should initialize pipeline with workouts and user data', async () => {
      const result = await pipeline.initialize(mockWorkouts, mockUser);

      expect(result.status).toBe('success');
      expect(result.exercisesAnalyzed).toBeGreaterThan(0);
      expect(result.modelsInitialized).toBe(true);
    });

    it('should handle insufficient data gracefully', async () => {
      const result = await pipeline.initialize([], mockUser);

      expect(result.status).toBe('insufficient_data');
      expect(result.exercisesAnalyzed).toBe(0);
    });

    it('should cache initialization results', async () => {
      const result1 = await pipeline.initialize(mockWorkouts, mockUser);
      const result2 = await pipeline.initialize(mockWorkouts, mockUser);

      expect(result2.fromCache).toBe(true);
    });
  });

  describe('predict', () => {
    beforeEach(async () => {
      await pipeline.initialize(mockWorkouts, mockUser);
    });

    it('should predict next weight for exercise with sufficient data', async () => {
      const result = await pipeline.predict('Bench Press', mockWorkouts);

      expect(result).toBeDefined();
      expect(result.nextWeight).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.modelUsed).toBe('ensemble');
    });

    it('should apply musculation constraints', async () => {
      const result = await pipeline.predict('Bench Press', mockWorkouts);

      const currentWeight = 85; // Poids actuel du Bench Press
      const increase = result.nextWeight - currentWeight;

      expect(increase).toBeGreaterThanOrEqual(0);
      expect(increase).toBeLessThanOrEqual(MUSCULATION_CONSTRAINTS.MAX_INCREMENT);
      
      // Vérifier les incréments de plaques
      const increment = result.nextWeight % MUSCULATION_CONSTRAINTS.MIN_INCREMENT;
      expect(increment).toBeCloseTo(0, 1);
    });

    it('should handle exercise with insufficient data', async () => {
      const result = await pipeline.predict('New Exercise', mockWorkouts);

      expect(result.nextWeight).toBeDefined();
      expect(result.confidence).toBeLessThan(0.6); // Confiance faible
      expect(result.reasoning).toContain('données insuffisantes');
    });

    it('should include plateau analysis', async () => {
      const result = await pipeline.predict('Bench Press', mockWorkouts);

      expect(result.plateauAnalysis).toBeDefined();
      expect(result.plateauAnalysis.hasPlateaus).toBeDefined();
      expect(result.plateauAnalysis.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('analyzeAllExercises', () => {
    beforeEach(async () => {
      await pipeline.initialize(mockWorkouts, mockUser);
    });

    it('should analyze all exercises found in workouts', async () => {
      const results = await pipeline.analyzeAllExercises(mockWorkouts);

      expect(results).toBeDefined();
      expect(Object.keys(results)).toContain('Bench Press');
      expect(Object.keys(results)).toContain('Squat');
    });

    it('should prioritize exercises with more data', async () => {
      const results = await pipeline.analyzeAllExercises(mockWorkouts);

      // Bench Press a plus de données que Squat
      expect(results['Bench Press'].confidence).toBeGreaterThan(results['Squat'].confidence);
    });

    it('should handle empty workouts gracefully', async () => {
      const results = await pipeline.analyzeAllExercises([]);

      expect(results).toEqual({});
    });
  });

  describe('getModelPerformanceMetrics', () => {
    beforeEach(async () => {
      await pipeline.initialize(mockWorkouts, mockUser);
    });

    it('should return performance metrics for all models', () => {
      const metrics = pipeline.getModelPerformanceMetrics();

      expect(metrics.ensemble).toBeDefined();
      expect(metrics.individual).toBeDefined();
      expect(metrics.individual.linear).toBeDefined();
      expect(metrics.individual.forest).toBeDefined();
      expect(metrics.individual.neural).toBeDefined();
    });

    it('should include model weights and performance scores', () => {
      const metrics = pipeline.getModelPerformanceMetrics();

      expect(metrics.ensemble.weights).toBeDefined();
      expect(metrics.ensemble.averageR2).toBeGreaterThanOrEqual(0);
      expect(metrics.ensemble.averageR2).toBeLessThanOrEqual(1);
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', () => {
      const stats = pipeline.getCacheStats();

      expect(stats.predictions).toBeDefined();
      expect(stats.predictions.size).toBeGreaterThanOrEqual(0);
      expect(stats.predictions.hitRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('error handling et edge cases', () => {
    it('should handle corrupted workout data', async () => {
      const corruptedWorkouts = [
        {
          id: null,
          date: 'invalid-date',
          exercises: null
        }
      ];

      const result = await pipeline.initialize(corruptedWorkouts, mockUser);
      expect(result.status).toBe('insufficient_data');
    });

    it('should handle missing exercise sets', async () => {
      const incompleteWorkouts = [
        {
          id: '1',
          date: '2024-01-01',
          exercises: [
            {
              name: 'Incomplete Exercise',
              sets: [] // Pas de sets
            }
          ]
        }
      ];

      const result = await pipeline.initialize(incompleteWorkouts, mockUser);
      expect(result.status).toBe('insufficient_data');
    });

    it('should handle extreme weight values', async () => {
      const extremeWorkouts = [
        {
          id: '1',
          date: '2024-01-01',
          exercises: [
            {
              name: 'Extreme Exercise',
              sets: [
                { weight: 1000, reps: 1 }, // Poids extrême
                { weight: 0.1, reps: 100 }, // Poids minimal
                { weight: -5, reps: 5 } // Poids négatif
              ]
            }
          ]
        }
      ];

      await pipeline.initialize(extremeWorkouts, mockUser);
      const result = await pipeline.predict('Extreme Exercise', extremeWorkouts);

      // Le système devrait gérer ces cas et appliquer les contraintes
      expect(result.nextWeight).toBeGreaterThan(0);
      expect(result.nextWeight).toBeLessThan(500); // Limite raisonnable
    });
  });

  describe('performance et optimisation', () => {
    it('should handle large datasets efficiently', async () => {
      // Générer un grand dataset
      const largeWorkouts = [];
      for (let i = 0; i < 100; i++) {
        largeWorkouts.push({
          id: `workout-${i}`,
          date: new Date(2024, 0, i + 1).toISOString(),
          exercises: [
            {
              name: 'Performance Test Exercise',
              sets: [
                { weight: 80 + (i % 10), reps: 8 - (i % 3) },
                { weight: 80 + (i % 10), reps: 7 - (i % 3) }
              ]
            }
          ]
        });
      }

      const startTime = Date.now();
      await pipeline.initialize(largeWorkouts, mockUser);
      const result = await pipeline.predict('Performance Test Exercise', largeWorkouts);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // Moins de 5 secondes
      expect(result.nextWeight).toBeDefined();
    });

    it('should use caching effectively', async () => {
      await pipeline.initialize(mockWorkouts, mockUser);
      
      // Première prédiction
      const start1 = Date.now();
      const result1 = await pipeline.predict('Bench Press', mockWorkouts);
      const end1 = Date.now();

      // Deuxième prédiction identique (devrait utiliser le cache)
      const start2 = Date.now();
      const result2 = await pipeline.predict('Bench Press', mockWorkouts);
      const end2 = Date.now();

      expect(end2 - start2).toBeLessThan(end1 - start1); // Plus rapide grâce au cache
      expect(result2.fromCache).toBe(true);
      expect(result2.nextWeight).toBe(result1.nextWeight);
    });
  });
});

describe('Intégration avec FeatureEngineer', () => {
  let featureEngineer;
  
  beforeEach(() => {
    featureEngineer = new FeatureEngineer();
  });

  it('should extract comprehensive features for ML models', () => {
    const exerciseData = [
      { date: '2024-01-01', weight: 80, reps: 8, sets: 3 },
      { date: '2024-01-08', weight: 82, reps: 8, sets: 3 },
      { date: '2024-01-15', weight: 85, reps: 6, sets: 3 }
    ];

    const features = featureEngineer.extractExerciseFeatures('Bench Press', [], {
      exerciseHistory: exerciseData,
      userLevel: 'intermediate'
    });

    expect(features.current_weight).toBeDefined();
    expect(features.progression_1week).toBeDefined();
    expect(features.volume_trend).toBeDefined();
    expect(features.consistency_score).toBeDefined();
    expect(features.user_level).toBeDefined();
  });
});

describe('Intégration avec EnsembleModel', () => {
  let ensemble;

  beforeEach(() => {
    ensemble = new EnsembleModel();
  });

  it('should combine predictions from multiple models', () => {
    const features = {
      current_weight: 80,
      progression_1week: 0.02,
      volume_trend: 0.01,
      user_level: 'intermediate'
    };

    const prediction = ensemble.predict(features);

    expect(prediction).toBeGreaterThan(80); // Progression positive
    expect(prediction).toBeLessThan(90); // Progression réaliste
  });

  it('should handle model weight distribution', () => {
    const weights = ensemble.getModelWeights();

    expect(weights.linear).toBeDefined();
    expect(weights.forest).toBeDefined();
    expect(weights.neural).toBeDefined();

    // Les poids devraient totaliser 1
    const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    expect(total).toBeCloseTo(1, 2);
  });
});

describe('Tests d\'intégration complète', () => {
  it('should handle complete prediction workflow', async () => {
    const pipeline = new AdvancedPredictionPipeline();
    const workouts = [
      {
        id: '1',
        date: '2024-01-01',
        exercises: [{
          name: 'Integration Test',
          sets: [{ weight: 80, reps: 8 }, { weight: 80, reps: 7 }]
        }]
      },
      {
        id: '2',
        date: '2024-01-08',
        exercises: [{
          name: 'Integration Test',
          sets: [{ weight: 82, reps: 8 }, { weight: 82, reps: 6 }]
        }]
      },
      {
        id: '3',
        date: '2024-01-15',
        exercises: [{
          name: 'Integration Test',
          sets: [{ weight: 85, reps: 6 }, { weight: 82, reps: 8 }]
        }]
      }
    ];

    const user = { level: 'intermediate' };

    // 1. Initialiser le pipeline
    const initResult = await pipeline.initialize(workouts, user);
    expect(initResult.status).toBe('success');

    // 2. Effectuer une prédiction
    const prediction = await pipeline.predict('Integration Test', workouts);
    expect(prediction.nextWeight).toBeGreaterThan(0);
    expect(prediction.confidence).toBeGreaterThan(0);

    // 3. Analyser tous les exercices
    const analysis = await pipeline.analyzeAllExercises(workouts);
    expect(analysis['Integration Test']).toBeDefined();

    // 4. Vérifier les métriques de performance
    const metrics = pipeline.getModelPerformanceMetrics();
    expect(metrics.ensemble).toBeDefined();

    // 5. Vérifier les statistiques de cache
    const cacheStats = pipeline.getCacheStats();
    expect(cacheStats.predictions).toBeDefined();
  });

  it('should maintain data quality throughout the pipeline', async () => {
    const pipeline = new AdvancedPredictionPipeline();
    const workouts = [
      {
        id: '1',
        date: '2024-01-01',
        exercises: [{
          name: 'Quality Test',
          sets: [
            { weight: 80, reps: 8 },
            { weight: 80, reps: 7 },
            { weight: 75, reps: 10 } // Variation normale
          ]
        }]
      },
      {
        id: '2',
        date: '2024-01-08',
        exercises: [{
          name: 'Quality Test',
          sets: [
            { weight: 82.5, reps: 8 }, // Increment réaliste
            { weight: 82.5, reps: 6 },
            { weight: 80, reps: 9 }
          ]
        }]
      }
    ];

    await pipeline.initialize(workouts, { level: 'intermediate' });
    const result = await pipeline.predict('Quality Test', workouts);

    // Vérifier la qualité des données de sortie
    expect(result.nextWeight).toBeFinite();
    expect(result.nextWeight).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(result.reasoning).toBeDefined();
    expect(result.plateauAnalysis).toBeDefined();
    expect(result.modelUsed).toBeDefined();
  });
});