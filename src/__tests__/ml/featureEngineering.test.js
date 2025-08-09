/**
 * Tests complets pour le système de feature engineering
 */

import { FeatureEngineer } from '../../utils/ml/featureEngineering';

describe('FeatureEngineer', () => {
  let featureEngineer;

  beforeEach(() => {
    featureEngineer = new FeatureEngineer();
  });

  describe('extractExerciseFeatures', () => {
    const mockWorkouts = [
      {
        id: '1',
        date: '2024-01-01',
        duration: 3600, // 1 heure
        exercises: [
          {
            name: 'Bench Press',
            sets: [
              { weight: 80, reps: 8 },
              { weight: 80, reps: 7 },
              { weight: 75, reps: 10 }
            ]
          },
          {
            name: 'Squat',
            sets: [
              { weight: 100, reps: 5 },
              { weight: 100, reps: 5 }
            ]
          }
        ]
      },
      {
        id: '2',
        date: '2024-01-08',
        duration: 3300, // 55 minutes
        exercises: [
          {
            name: 'Bench Press',
            sets: [
              { weight: 82, reps: 8 },
              { weight: 82, reps: 6 },
              { weight: 80, reps: 8 }
            ]
          }
        ]
      },
      {
        id: '3',
        date: '2024-01-15',
        duration: 3900, // 1h05
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

    it('should extract comprehensive features for an exercise', () => {
      const features = featureEngineer.extractExerciseFeatures('Bench Press', mockWorkouts, {
        userLevel: 'intermediate',
        experienceMonths: 24,
        exerciseHistory: [
          { date: '2024-01-01', weight: 80, reps: 8, sets: 3 },
          { date: '2024-01-08', weight: 82, reps: 8, sets: 3 },
          { date: '2024-01-15', weight: 85, reps: 6, sets: 3 }
        ]
      });

      // Vérifier les features principales
      expect(features.current_weight).toBeDefined();
      expect(features.max_weight_last_session).toBeDefined();
      expect(features.progression_1week).toBeDefined();
      expect(features.progression_2weeks).toBeDefined();
      expect(features.progression_4weeks).toBeDefined();
      expect(features.volume_trend).toBeDefined();
      expect(features.intensity_score).toBeDefined();
      expect(features.consistency_score).toBeDefined();
      expect(features.user_level).toBeDefined();
      expect(features.exercise_frequency).toBeDefined();
    });

    it('should calculate temporal features correctly', () => {
      const exerciseHistory = [
        { date: '2024-01-01', weight: 80, reps: 8 },
        { date: '2024-01-08', weight: 82, reps: 8 }, // +2.5%
        { date: '2024-01-15', weight: 85, reps: 6 }, // +3.7%
        { date: '2024-01-22', weight: 87, reps: 6 }  // +2.4%
      ];

      const temporal = featureEngineer.extractTemporalFeatures(exerciseHistory);

      expect(temporal.progression_1week).toBeDefined();
      expect(temporal.progression_2weeks).toBeDefined();
      expect(temporal.progression_4weeks).toBeDefined();
      expect(temporal.time_since_last_session).toBeGreaterThanOrEqual(0);
    });

    it('should calculate performance metrics', () => {
      const exerciseHistory = [
        { date: '2024-01-01', weight: 80, reps: 8, sets: 3 },
        { date: '2024-01-08', weight: 82, reps: 8, sets: 3 },
        { date: '2024-01-15', weight: 85, reps: 6, sets: 3 }
      ];

      const performance = featureEngineer.extractPerformanceFeatures(exerciseHistory);

      expect(performance.volume_trend).toBeDefined();
      expect(performance.intensity_score).toBeGreaterThanOrEqual(0);
      expect(performance.current_weight).toBe(85);
      expect(performance.max_weight).toBe(85);
    });

    it('should extract behavioral patterns', () => {
      const workouts = [
        { date: '2024-01-01', duration: 3600 },
        { date: '2024-01-03', duration: 3300 },
        { date: '2024-01-05', duration: 3900 },
        { date: '2024-01-08', duration: 3600 }
      ];

      const behavioral = featureEngineer.extractBehavioralFeatures(workouts, []);

      expect(behavioral.workout_frequency).toBeGreaterThan(0);
      expect(behavioral.average_session_duration).toBeGreaterThan(0);
      expect(behavioral.training_consistency).toBeDefined();
      expect(behavioral.rest_day_patterns).toBeDefined();
    });

    it('should handle contextual features', () => {
      const contextual = featureEngineer.extractContextualFeatures('Bench Press', {
        userLevel: 'advanced',
        experienceMonths: 36,
        preferences: { focusAreas: ['strength'] }
      });

      expect(contextual.exercise_type).toBeDefined();
      expect(contextual.muscle_group).toBeDefined();
      expect(contextual.user_level).toBe('advanced');
      expect(contextual.experience_months).toBe(36);
      expect(contextual.compound_movement).toBeDefined();
    });

    it('should normalize features properly', () => {
      const rawFeatures = {
        current_weight: 85,
        progression_1week: 0.03,
        volume_trend: 150,
        user_level: 'intermediate',
        experience_months: 24
      };

      const normalized = featureEngineer.normalizeFeatures(rawFeatures);

      expect(normalized.current_weight).toBeCloseTo(0.85, 2); // 85/100
      expect(normalized.progression_1week).toBeDefined();
      expect(normalized.volume_trend).toBeDefined();
      expect(normalized.user_level_encoded).toBeDefined();
    });
  });

  describe('extractTemporalFeatures', () => {
    it('should handle insufficient data gracefully', () => {
      const shortHistory = [
        { date: '2024-01-01', weight: 80, reps: 8 }
      ];

      const temporal = featureEngineer.extractTemporalFeatures(shortHistory);

      expect(temporal.progression_1week).toBe(0);
      expect(temporal.progression_2weeks).toBe(0);
      expect(temporal.progression_4weeks).toBe(0);
      expect(temporal.time_since_last_session).toBeGreaterThanOrEqual(0);
    });

    it('should calculate progression rates accurately', () => {
      const progressiveHistory = [
        { date: '2024-01-01', weight: 80, reps: 8 },
        { date: '2024-01-08', weight: 82, reps: 8 }, // +2.5%
        { date: '2024-01-15', weight: 84, reps: 8 }, // +2.4%
        { date: '2024-01-22', weight: 86, reps: 8 }  // +2.4%
      ];

      const temporal = featureEngineer.extractTemporalFeatures(progressiveHistory);

      expect(temporal.progression_1week).toBeCloseTo(0.024, 2);
      expect(temporal.progression_2weeks).toBeGreaterThan(0);
      expect(temporal.recent_pr).toBe(true);
    });

    it('should detect recent personal records', () => {
      const prHistory = [
        { date: '2024-01-01', weight: 80, reps: 8 },
        { date: '2024-01-08', weight: 80, reps: 8 },
        { date: '2024-01-15', weight: 85, reps: 8 } // PR récent
      ];

      const temporal = featureEngineer.extractTemporalFeatures(prHistory);

      expect(temporal.recent_pr).toBe(true);
      expect(temporal.days_since_pr).toBeLessThan(14);
    });

    it('should handle regression periods', () => {
      const regressionHistory = [
        { date: '2024-01-01', weight: 85, reps: 8 },
        { date: '2024-01-08', weight: 82, reps: 8 }, // Régression
        { date: '2024-01-15', weight: 80, reps: 8 }  // Plus de régression
      ];

      const temporal = featureEngineer.extractTemporalFeatures(regressionHistory);

      expect(temporal.progression_1week).toBeLessThan(0);
      expect(temporal.progression_2weeks).toBeLessThan(0);
    });
  });

  describe('extractPerformanceFeatures', () => {
    it('should calculate volume trends', () => {
      const volumeHistory = [
        { date: '2024-01-01', weight: 80, reps: 8, sets: 3 }, // Volume: 1920
        { date: '2024-01-08', weight: 82, reps: 8, sets: 3 }, // Volume: 1968
        { date: '2024-01-15', weight: 85, reps: 6, sets: 3 }  // Volume: 1530
      ];

      const performance = featureEngineer.extractPerformanceFeatures(volumeHistory);

      expect(performance.volume_trend).toBeDefined();
      expect(performance.current_volume).toBe(1530);
      expect(performance.max_volume_last_4weeks).toBe(1968);
    });

    it('should calculate intensity scores', () => {
      const intensityHistory = [
        { date: '2024-01-01', weight: 80, reps: 8 },
        { date: '2024-01-08', weight: 90, reps: 5 }, // Plus intense
        { date: '2024-01-15', weight: 85, reps: 6 }
      ];

      const performance = featureEngineer.extractPerformanceFeatures(intensityHistory);

      expect(performance.intensity_score).toBeGreaterThan(0);
      expect(performance.intensity_score).toBeLessThanOrEqual(1);
    });

    it('should measure consistency', () => {
      const consistentHistory = [
        { date: '2024-01-01', weight: 80, reps: 8 },
        { date: '2024-01-08', weight: 80, reps: 8 },
        { date: '2024-01-15', weight: 80, reps: 8 },
        { date: '2024-01-22', weight: 80, reps: 8 }
      ];

      const inconsistentHistory = [
        { date: '2024-01-01', weight: 80, reps: 8 },
        { date: '2024-01-08', weight: 90, reps: 5 },
        { date: '2024-01-15', weight: 70, reps: 12 },
        { date: '2024-01-22', weight: 85, reps: 6 }
      ];

      const consistentPerf = featureEngineer.extractPerformanceFeatures(consistentHistory);
      const inconsistentPerf = featureEngineer.extractPerformanceFeatures(inconsistentHistory);

      expect(consistentPerf.consistency_score).toBeGreaterThan(inconsistentPerf.consistency_score);
    });

    it('should calculate momentum', () => {
      const momentumHistory = [
        { date: '2024-01-01', weight: 80, reps: 8 },
        { date: '2024-01-08', weight: 82, reps: 8 },
        { date: '2024-01-15', weight: 85, reps: 8 }
      ];

      const performance = featureEngineer.extractPerformanceFeatures(momentumHistory);

      expect(performance.momentum_score).toBeGreaterThan(0);
    });
  });

  describe('extractBehavioralFeatures', () => {
    it('should calculate workout frequency', () => {
      const weeklyWorkouts = [
        { date: '2024-01-01' },
        { date: '2024-01-03' },
        { date: '2024-01-05' },
        { date: '2024-01-08' },
        { date: '2024-01-10' },
        { date: '2024-01-12' },
        { date: '2024-01-15' }
      ];

      const behavioral = featureEngineer.extractBehavioralFeatures(weeklyWorkouts, []);

      expect(behavioral.workout_frequency).toBeCloseTo(3.5, 1); // ~3.5 par semaine
    });

    it('should analyze session duration patterns', () => {
      const durationWorkouts = [
        { date: '2024-01-01', duration: 3600 }, // 1h
        { date: '2024-01-03', duration: 3300 }, // 55min
        { date: '2024-01-05', duration: 3900 }, // 1h05
        { date: '2024-01-08', duration: 3600 }  // 1h
      ];

      const behavioral = featureEngineer.extractBehavioralFeatures(durationWorkouts, []);

      expect(behavioral.average_session_duration).toBeCloseTo(3675, 10); // Moyenne ~61.25 min
      expect(behavioral.duration_consistency).toBeDefined();
    });

    it('should detect training patterns', () => {
      const patternWorkouts = [
        { date: '2024-01-01' }, // Lundi
        { date: '2024-01-03' }, // Mercredi
        { date: '2024-01-05' }, // Vendredi
        { date: '2024-01-08' }, // Lundi
        { date: '2024-01-10' }, // Mercredi
        { date: '2024-01-12' }  // Vendredi
      ];

      const behavioral = featureEngineer.extractBehavioralFeatures(patternWorkouts, []);

      expect(behavioral.training_consistency).toBeGreaterThan(0.5);
      expect(behavioral.rest_day_patterns).toBeDefined();
    });

    it('should handle irregular schedules', () => {
      const irregularWorkouts = [
        { date: '2024-01-01' },
        { date: '2024-01-05' }, // 4 jours plus tard
        { date: '2024-01-06' }, // Jour suivant
        { date: '2024-01-15' }  // 9 jours plus tard
      ];

      const behavioral = featureEngineer.extractBehavioralFeatures(irregularWorkouts, []);

      expect(behavioral.training_consistency).toBeLessThan(0.5);
      expect(behavioral.workout_frequency).toBeLessThan(3);
    });
  });

  describe('extractContextualFeatures', () => {
    it('should classify exercise types correctly', () => {
      const benchPress = featureEngineer.extractContextualFeatures('Bench Press', {});
      const bicepCurl = featureEngineer.extractContextualFeatures('Bicep Curl', {});
      const squat = featureEngineer.extractContextualFeatures('Squat', {});

      expect(benchPress.compound_movement).toBe(true);
      expect(benchPress.muscle_group).toBe('chest');
      expect(bicepCurl.compound_movement).toBe(false);
      expect(bicepCurl.muscle_group).toBe('arms');
      expect(squat.compound_movement).toBe(true);
      expect(squat.muscle_group).toBe('legs');
    });

    it('should encode user level properly', () => {
      const beginner = featureEngineer.extractContextualFeatures('Test', { userLevel: 'beginner' });
      const intermediate = featureEngineer.extractContextualFeatures('Test', { userLevel: 'intermediate' });
      const advanced = featureEngineer.extractContextualFeatures('Test', { userLevel: 'advanced' });

      expect(beginner.user_level).toBe('beginner');
      expect(intermediate.user_level).toBe('intermediate');
      expect(advanced.user_level).toBe('advanced');
    });

    it('should handle experience months', () => {
      const contextual = featureEngineer.extractContextualFeatures('Test', {
        experienceMonths: 18
      });

      expect(contextual.experience_months).toBe(18);
    });
  });

  describe('normalizeFeatures', () => {
    it('should normalize numerical features', () => {
      const features = {
        current_weight: 85,
        progression_1week: 0.05, // 5%
        volume_trend: 200,
        intensity_score: 0.8,
        experience_months: 24
      };

      const normalized = featureEngineer.normalizeFeatures(features);

      expect(normalized.current_weight).toBeCloseTo(0.85, 2);
      expect(normalized.progression_1week).toBeCloseTo(0.5, 1); // 5% -> 0.5
      expect(normalized.volume_trend).toBeLessThanOrEqual(1);
      expect(normalized.experience_months).toBeCloseTo(0.24, 2); // 24/100
    });

    it('should encode categorical features', () => {
      const features = {
        user_level: 'advanced',
        exercise_type: 'compound',
        muscle_group: 'chest'
      };

      const normalized = featureEngineer.normalizeFeatures(features);

      expect(normalized.user_level_encoded).toBe(3); // advanced = 3
      expect(normalized.exercise_type_encoded).toBe(1); // compound = 1
      expect(normalized.muscle_group_encoded).toBeDefined();
    });

    it('should handle missing values', () => {
      const features = {
        current_weight: 85,
        progression_1week: null,
        volume_trend: undefined,
        user_level: 'intermediate'
      };

      const normalized = featureEngineer.normalizeFeatures(features);

      expect(normalized.current_weight).toBeDefined();
      expect(normalized.progression_1week).toBe(0); // Default pour null
      expect(normalized.volume_trend).toBe(0); // Default pour undefined
      expect(normalized.user_level_encoded).toBe(2); // intermediate = 2
    });

    it('should handle extreme values', () => {
      const features = {
        current_weight: 500, // Très lourd
        progression_1week: -0.5, // Régression massive
        volume_trend: 10000 // Volume énorme
      };

      const normalized = featureEngineer.normalizeFeatures(features);

      // Les valeurs doivent être clampées
      expect(normalized.current_weight).toBeLessThanOrEqual(1);
      expect(normalized.progression_1week).toBeGreaterThanOrEqual(-1);
      expect(normalized.volume_trend).toBeLessThanOrEqual(1);
    });
  });

  describe('edge cases et robustesse', () => {
    it('should handle empty workout history', () => {
      const features = featureEngineer.extractExerciseFeatures('Empty Exercise', [], {
        userLevel: 'intermediate'
      });

      expect(features).toBeDefined();
      expect(features.current_weight).toBe(0);
      expect(features.progression_1week).toBe(0);
      expect(features.user_level).toBe('intermediate');
    });

    it('should handle corrupted data gracefully', () => {
      const corruptedWorkouts = [
        { id: null, date: 'invalid', exercises: null },
        { id: '2', date: '2024-01-08', exercises: [{ name: null, sets: [] }] },
        { id: '3', exercises: [{ name: 'Test', sets: [{ weight: 'invalid', reps: null }] }] }
      ];

      expect(() => {
        featureEngineer.extractExerciseFeatures('Test', corruptedWorkouts, {});
      }).not.toThrow();
    });

    it('should handle single data point', () => {
      const singleWorkout = [
        {
          id: '1',
          date: '2024-01-01',
          exercises: [{
            name: 'Single Test',
            sets: [{ weight: 80, reps: 8 }]
          }]
        }
      ];

      const features = featureEngineer.extractExerciseFeatures('Single Test', singleWorkout, {
        userLevel: 'beginner'
      });

      expect(features.current_weight).toBe(80);
      expect(features.progression_1week).toBe(0); // Pas de progression calculable
    });

    it('should handle large datasets efficiently', () => {
      // Générer 1000 workouts
      const largeWorkouts = Array.from({ length: 1000 }, (_, i) => ({
        id: `workout-${i}`,
        date: new Date(2024, 0, i + 1).toISOString(),
        duration: 3600 + (i % 600), // Durée variable
        exercises: [{
          name: 'Performance Test',
          sets: [
            { weight: 80 + (i % 20), reps: 8 - (i % 3) },
            { weight: 80 + (i % 20), reps: 7 - (i % 3) }
          ]
        }]
      }));

      const startTime = Date.now();
      const features = featureEngineer.extractExerciseFeatures('Performance Test', largeWorkouts, {
        userLevel: 'intermediate',
        experienceMonths: 36
      });
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Moins d'1 seconde
      expect(features).toBeDefined();
      expect(features.current_weight).toBeGreaterThan(0);
    });
  });

  describe('utility methods', () => {
    it('should calculate variance correctly', () => {
      expect(featureEngineer.calculateVariance([1, 2, 3, 4, 5])).toBeCloseTo(2, 0);
      expect(featureEngineer.calculateVariance([5, 5, 5, 5])).toBe(0);
      expect(featureEngineer.calculateVariance([])).toBe(0);
      expect(featureEngineer.calculateVariance([1])).toBe(0);
    });

    it('should calculate linear regression slope', () => {
      const increasing = [1, 2, 3, 4, 5];
      const decreasing = [5, 4, 3, 2, 1];
      const flat = [3, 3, 3, 3];

      expect(featureEngineer.calculateTrend(increasing)).toBeGreaterThan(0);
      expect(featureEngineer.calculateTrend(decreasing)).toBeLessThan(0);
      expect(featureEngineer.calculateTrend(flat)).toBeCloseTo(0, 1);
    });

    it('should classify muscle groups accurately', () => {
      expect(featureEngineer.classifyMuscleGroup('Bench Press')).toBe('chest');
      expect(featureEngineer.classifyMuscleGroup('Squat')).toBe('legs');
      expect(featureEngineer.classifyMuscleGroup('Pull-up')).toBe('back');
      expect(featureEngineer.classifyMuscleGroup('Bicep Curl')).toBe('arms');
      expect(featureEngineer.classifyMuscleGroup('Shoulder Press')).toBe('shoulders');
      expect(featureEngineer.classifyMuscleGroup('Unknown Exercise')).toBe('other');
    });

    it('should determine compound vs isolation movements', () => {
      expect(featureEngineer.isCompoundMovement('Bench Press')).toBe(true);
      expect(featureEngineer.isCompoundMovement('Squat')).toBe(true);
      expect(featureEngineer.isCompoundMovement('Deadlift')).toBe(true);
      expect(featureEngineer.isCompoundMovement('Bicep Curl')).toBe(false);
      expect(featureEngineer.isCompoundMovement('Tricep Extension')).toBe(false);
    });
  });
});