/**
 * Tests d'intégration globaux pour le système ML complet
 */

import { MLContinuousLearning } from '../../utils/ml/continuousLearning';
import { AdvancedPlateauDetector } from '../../utils/ml/plateauDetection';
import { FeatureEngineer } from '../../utils/ml/featureEngineering';

describe('ML System Integration Tests', () => {
  describe('Système complet ML', () => {
    it('should integrate all ML components successfully', () => {
      // 1. Test FeatureEngineer
      const featureEngineer = new FeatureEngineer();
      const features = featureEngineer.extractExerciseFeatures('Bench Press', [], {
        exerciseHistory: [
          { date: '2024-01-01', weight: 80, reps: 8 },
          { date: '2024-01-08', weight: 82, reps: 8 },
          { date: '2024-01-15', weight: 85, reps: 6 }
        ],
        userLevel: 'intermediate'
      });

      expect(features).toBeDefined();
      expect(features.current_weight).toBeGreaterThan(0);
      expect(features.user_level).toBe('intermediate');

      // 2. Test Plateau Detection
      const plateauDetector = new AdvancedPlateauDetector();
      const plateauAnalysis = plateauDetector.analyzeExercisePlateau('Bench Press', [
        { date: '2024-01-01', weight: 80, reps: 8 },
        { date: '2024-01-08', weight: 80, reps: 8 },
        { date: '2024-01-15', weight: 80, reps: 8 },
        { date: '2024-01-22', weight: 80, reps: 8 },
        { date: '2024-01-29', weight: 80, reps: 8 }
      ], 'intermediate');

      expect(plateauAnalysis).toBeDefined();
      expect(plateauAnalysis.hasPlateaus).toBe(true);
      expect(plateauAnalysis.recommendations).toBeInstanceOf(Array);

      // 3. Test Continuous Learning
      const predictionId = MLContinuousLearning.trackPrediction(
        'Integration Test',
        { nextWeight: 87, confidence: 0.85 },
        features,
        'intermediate'
      );

      expect(predictionId).toBeDefined();

      const validation = MLContinuousLearning.validatePrediction(
        { nextWeight: 87, confidence: 0.85 },
        { current_weight: 85, user_level: 'intermediate' },
        [{ weight: 80 }, { weight: 82 }, { weight: 85 }]
      );

      expect(validation.isValid).toBe(true);
      expect(validation.confidence).toBeGreaterThan(0);

      // 4. Test feedback system
      const feedbackResult = MLContinuousLearning.provideFeedback(
        predictionId,
        'actual_performance',
        { actualWeight: 86 }
      );

      expect(feedbackResult).toBe(true);

      // 5. Test metrics report
      const report = MLContinuousLearning.getMetricsReport();
      expect(report.summary.totalPredictions).toBeGreaterThan(0);
    });

    it('should handle complete workflow with multiple exercises', () => {
      const featureEngineer = new FeatureEngineer();
      const plateauDetector = new AdvancedPlateauDetector();

      const exerciseData = {
        'Bench Press': [
          { date: '2024-01-01', weight: 80, reps: 8 },
          { date: '2024-01-08', weight: 82, reps: 8 },
          { date: '2024-01-15', weight: 85, reps: 6 }
        ],
        'Squat': [
          { date: '2024-01-01', weight: 100, reps: 5 },
          { date: '2024-01-08', weight: 100, reps: 5 },
          { date: '2024-01-15', weight: 100, reps: 5 },
          { date: '2024-01-22', weight: 100, reps: 5 },
          { date: '2024-01-29', weight: 100, reps: 5 }
        ]
      };

      // Analyser chaque exercice
      Object.entries(exerciseData).forEach(([exerciseName, history]) => {
        // Features
        const features = featureEngineer.extractExerciseFeatures(exerciseName, [], {
          exerciseHistory: history,
          userLevel: 'intermediate'
        });

        expect(features.exerciseName).toBe(exerciseName);
        expect(features.current_weight).toBeGreaterThan(0);

        // Plateau detection
        const plateauAnalysis = plateauDetector.analyzeExercisePlateau(
          exerciseName, 
          history, 
          'intermediate'
        );

        expect(plateauAnalysis.hasPlateaus).toBeDefined();
        expect(plateauAnalysis.recommendations).toBeInstanceOf(Array);

        // Continuous learning
        const predictionId = MLContinuousLearning.trackPrediction(
          exerciseName,
          { 
            nextWeight: features.current_weight + 2, 
            confidence: 0.8 
          },
          features,
          'intermediate'
        );

        expect(predictionId).toBeDefined();
      });

      // Vérifier le rapport final
      const report = MLContinuousLearning.getMetricsReport();
      expect(report.summary.totalPredictions).toBeGreaterThanOrEqual(2); // Au moins Bench + Squat
    });

    it('should maintain data quality across all components', () => {
      const testData = [
        { date: '2024-01-01', weight: 80, reps: 8 },
        { date: '2024-01-08', weight: 82.5, reps: 8 },
        { date: '2024-01-15', weight: 85, reps: 6 },
        { date: '2024-01-22', weight: 87.5, reps: 5 }
      ];

      // Test Feature Engineering quality
      const featureEngineer = new FeatureEngineer();
      const features = featureEngineer.extractExerciseFeatures('Quality Test', [], {
        exerciseHistory: testData,
        userLevel: 'advanced'
      });

      // Vérifier la qualité des features
      expect(isFinite(features.current_weight)).toBe(true);
      expect(isFinite(features.progression_1week)).toBe(true);
      expect(['advanced', 'intermediate']).toContain(features.user_level);

      // Test Plateau Detection quality
      const plateauDetector = new AdvancedPlateauDetector();
      const plateauAnalysis = plateauDetector.analyzeExercisePlateau(
        'Quality Test',
        testData,
        'advanced'
      );

      expect(plateauAnalysis.confidence).toBeGreaterThanOrEqual(0);
      expect(plateauAnalysis.confidence).toBeLessThanOrEqual(100);
      expect(plateauAnalysis.recommendations.length).toBeGreaterThan(0);

      // Test Validation quality
      const validation = MLContinuousLearning.validatePrediction(
        { nextWeight: 90, confidence: 0.9 },
        { current_weight: 87.5, user_level: 'advanced' },
        testData
      );

      expect(validation.confidence).toBeGreaterThanOrEqual(0);
      expect(validation.confidence).toBeLessThanOrEqual(1);
      expect(validation.qualityScore).toBeGreaterThanOrEqual(0);
      expect(validation.qualityScore).toBeLessThanOrEqual(1);
    });

    it('should handle performance with large datasets', async () => {
      // Générer un grand dataset
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
        weight: 80 + (i % 20),
        reps: 8 - (i % 3)
      }));

      const startTime = Date.now();

      // Test performance avec toutes les composantes
      const featureEngineer = new FeatureEngineer();
      const features = featureEngineer.extractExerciseFeatures('Performance Test', [], {
        exerciseHistory: largeDataset,
        userLevel: 'intermediate'
      });

      const plateauDetector = new AdvancedPlateauDetector();
      const plateauAnalysis = plateauDetector.analyzeExercisePlateau(
        'Performance Test',
        largeDataset,
        'intermediate'
      );

      const predictionId = MLContinuousLearning.trackPrediction(
        'Performance Test',
        { nextWeight: features.current_weight + 1, confidence: 0.8 },
        features,
        'intermediate'
      );

      const validation = MLContinuousLearning.validatePrediction(
        { nextWeight: features.current_weight + 1, confidence: 0.8 },
        { current_weight: features.current_weight, user_level: 'intermediate' },
        largeDataset
      );

      const endTime = Date.now();

      // Vérifier les résultats
      expect(features).toBeDefined();
      expect(plateauAnalysis).toBeDefined();
      expect(predictionId).toBeDefined();
      expect(validation).toBeDefined();

      // Vérifier les performances (moins de 1 seconde)
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should handle edge cases gracefully across all components', () => {
      // Test avec données vides
      const featureEngineer = new FeatureEngineer();
      const emptyFeatures = featureEngineer.extractExerciseFeatures('Empty Test', [], {
        exerciseHistory: [],
        userLevel: 'beginner'
      });

      expect(emptyFeatures.current_weight).toBe(0);
      expect(emptyFeatures.progression_1week).toBe(0);

      // Test plateau detection avec données insuffisantes
      const plateauDetector = new AdvancedPlateauDetector();
      const plateauAnalysis = plateauDetector.analyzeExercisePlateau('Empty Test', [], 'beginner');

      expect(plateauAnalysis.hasPlateaus).toBe(false);
      expect(plateauAnalysis.confidence).toBe(0);

      // Test validation avec prédiction extreme
      const extremeValidation = MLContinuousLearning.validatePrediction(
        { nextWeight: 200, confidence: 0.9 }, // Poids irréaliste
        { current_weight: 80, user_level: 'beginner' },
        [{ weight: 80 }]
      );

      expect(extremeValidation.isValid).toBe(false);
      expect(extremeValidation.warnings.length).toBeGreaterThan(0);

      // Test avec données corrompues
      const corruptedData = [
        { date: 'invalid', weight: 'not-a-number', reps: null },
        { date: '2024-01-01', weight: -10, reps: 0 },
        { date: null, weight: Infinity, reps: 1000 }
      ];

      expect(() => {
        featureEngineer.extractExerciseFeatures('Corrupted Test', [], {
          exerciseHistory: corruptedData,
          userLevel: 'intermediate'
        });
      }).not.toThrow();

      expect(() => {
        plateauDetector.analyzeExercisePlateau('Corrupted Test', corruptedData, 'intermediate');
      }).not.toThrow();
    });
  });

  describe('Component Interoperability', () => {
    it('should pass data correctly between components', () => {
      // Flux de données réaliste
      const workoutHistory = [
        { date: '2024-01-01', weight: 80, reps: 8 },
        { date: '2024-01-08', weight: 82, reps: 8 },
        { date: '2024-01-15', weight: 84, reps: 7 },
        { date: '2024-01-22', weight: 86, reps: 6 }
      ];

      // 1. Feature Engineering → Plateau Detection
      const featureEngineer = new FeatureEngineer();
      const features = featureEngineer.extractExerciseFeatures('Interop Test', [], {
        exerciseHistory: workoutHistory,
        userLevel: 'intermediate'
      });

      const plateauDetector = new AdvancedPlateauDetector();
      const plateauAnalysis = plateauDetector.analyzeExercisePlateau(
        'Interop Test',
        workoutHistory,
        features.user_level
      );

      // 2. Features + Plateau → Continuous Learning
      const prediction = {
        nextWeight: features.current_weight + 1,
        confidence: plateauAnalysis.hasPlateaus ? 0.6 : 0.9,
        plateauAnalysis
      };

      const predictionId = MLContinuousLearning.trackPrediction(
        'Interop Test',
        prediction,
        features,
        features.user_level
      );

      // 3. Validation utilise toutes les données
      const validation = MLContinuousLearning.validatePrediction(
        prediction,
        {
          current_weight: features.current_weight,
          user_level: features.user_level,
          progression_1week: features.progression_1week
        },
        workoutHistory
      );

      // Vérifier la cohérence des données
      expect(features.current_weight).toBe(86); // Dernière valeur
      expect(prediction.confidence).toBeGreaterThan(0);
      expect(validation.isValid).toBeDefined();

      // Les composants doivent être cohérents
      if (plateauAnalysis.hasPlateaus) {
        expect(prediction.confidence).toBeLessThan(0.9); // Confiance réduite en cas de plateau
      }

      if (!validation.isValid) {
        expect(validation.warnings.length).toBeGreaterThan(0);
      }

      expect(predictionId).toBeDefined();
    });

    it('should maintain consistency across different user levels', () => {
      const testData = [
        { date: '2024-01-01', weight: 60, reps: 10 },
        { date: '2024-01-08', weight: 62, reps: 10 },
        { date: '2024-01-15', weight: 64, reps: 10 }
      ];

      const userLevels = ['beginner', 'intermediate', 'advanced'];
      const results = {};

      userLevels.forEach(level => {
        const featureEngineer = new FeatureEngineer();
        const features = featureEngineer.extractExerciseFeatures('Level Test', [], {
          exerciseHistory: testData,
          userLevel: level
        });

        const plateauDetector = new AdvancedPlateauDetector();
        const plateauAnalysis = plateauDetector.analyzeExercisePlateau(
          'Level Test',
          testData,
          level
        );

        const validation = MLContinuousLearning.validatePrediction(
          { nextWeight: 66, confidence: 0.8 },
          { current_weight: 64, user_level: level },
          testData
        );

        results[level] = { features, plateauAnalysis, validation };
      });

      // Vérifier que tous les niveaux produisent des résultats valides
      Object.values(results).forEach(result => {
        expect(result.features).toBeDefined();
        expect(result.plateauAnalysis).toBeDefined();
        expect(result.validation).toBeDefined();
      });

      // Les débutants devraient avoir des seuils plus tolérants
      expect(results.beginner.validation.confidence).toBeGreaterThanOrEqual(
        results.advanced.validation.confidence
      );
    });
  });
});