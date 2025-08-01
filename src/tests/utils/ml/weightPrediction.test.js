import {
  predictNextWeight,
  getProgressionInsights,
  analyzeAllExercises,
} from '../../../utils/ml/weightPrediction';

// Données de test
const mockWorkouts = [
  {
    date: '2025-01-01',
    exercises: [
      {
        name: 'Pompes',
        sets: [
          { weight: 50, reps: 10 },
          { weight: 52.5, reps: 8 },
          { weight: 55, reps: 6 },
        ],
      },
      {
        name: 'Squats',
        sets: [
          { weight: 80, reps: 12 },
          { weight: 85, reps: 10 },
          { weight: 90, reps: 8 },
        ],
      },
    ],
  },
  {
    date: '2025-01-03',
    exercises: [
      {
        name: 'Pompes',
        sets: [
          { weight: 52.5, reps: 10 },
          { weight: 55, reps: 8 },
          { weight: 57.5, reps: 6 },
        ],
      },
    ],
  },
  {
    date: '2025-01-05',
    exercises: [
      {
        name: 'Pompes',
        sets: [
          { weight: 55, reps: 10 },
          { weight: 57.5, reps: 8 },
          { weight: 60, reps: 6 },
        ],
      },
      {
        name: 'Squats',
        sets: [
          { weight: 85, reps: 12 },
          { weight: 90, reps: 10 },
          { weight: 95, reps: 8 },
        ],
      },
    ],
  },
  {
    date: '2025-01-07',
    exercises: [
      {
        name: 'Pompes',
        sets: [
          { weight: 57.5, reps: 10 },
          { weight: 60, reps: 8 },
          { weight: 62.5, reps: 6 },
        ],
      },
    ],
  },
  {
    date: '2025-01-09',
    exercises: [
      {
        name: 'Pompes',
        sets: [
          { weight: 60, reps: 10 },
          { weight: 62.5, reps: 8 },
          { weight: 65, reps: 6 },
        ],
      },
    ],
  },
];

const mockWorkoutsWithCardio = [
  {
    date: '2025-01-01',
    exercises: [
      {
        name: 'Course',
        type: 'cardio',
        sets: [
          { duration: 20, reps: 5 },
        ],
      },
    ],
  },
];

describe('Système ML de Prédiction de Poids', () => {
  describe('predictNextWeight', () => {
    test('devrait prédire le prochain poids pour un exercice avec progression', () => {
      const result = predictNextWeight('Pompes', mockWorkouts);
      
      expect(result).toBeDefined();
      expect(result.predictedWeight).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.trend).toBeDefined();
      expect(result.recommendation).toBeDefined();
      expect(result.factors).toBeInstanceOf(Array);
      expect(result.lastWeight).toBe(65);
      
      // Vérifier que la prédiction est réaliste
      expect(result.predictedWeight).toBeGreaterThanOrEqual(65);
      expect(result.predictedWeight).toBeLessThanOrEqual(65 * 1.2); // Max +20%
    });

    test('devrait gérer un exercice sans données', () => {
      const result = predictNextWeight('ExerciceInexistant', mockWorkouts);
      
      expect(result.predictedWeight).toBe(0);
      expect(result.confidence).toBe(0);
      expect(result.trend).toBe('no_data');
      expect(result.recommendation).toBe('Pas assez de données pour prédire');
    });

    test('devrait gérer les exercices cardio (pas de poids)', () => {
      const result = predictNextWeight('Course', mockWorkoutsWithCardio);
      
      expect(result.predictedWeight).toBe(0);
      expect(result.confidence).toBe(0);
    });

    test('devrait calculer correctement la progression moyenne', () => {
      const result = predictNextWeight('Pompes', mockWorkouts);
      
      // La progression moyenne devrait être positive car les poids augmentent
      expect(result.progression).toBeGreaterThan(0);
      expect(typeof result.progression).toBe('number');
    });

    test('devrait détecter une tendance croissante', () => {
      const result = predictNextWeight('Pompes', mockWorkouts);
      
      expect(result.trend).toBe('increasing');
    });

    test('devrait calculer la fréquence d\'entraînement', () => {
      const result = predictNextWeight('Pompes', mockWorkouts);
      
      expect(result.frequency).toBeGreaterThanOrEqual(0);
      expect(typeof result.frequency).toBe('number');
    });

    test('devrait gérer les erreurs gracieusement', () => {
      const result = predictNextWeight('Pompes', null);
      
      expect(result.predictedWeight).toBe(0);
      expect(result.trend).toBe('error');
      expect(result.recommendation).toBe('Erreur de prédiction');
    });
  });

  describe('getProgressionInsights', () => {
    test('devrait fournir des insights complets', () => {
      const result = getProgressionInsights('Pompes', mockWorkouts);
      
      expect(result.insights).toBeInstanceOf(Array);
      expect(result.insights.length).toBeGreaterThan(0);
      
      // Vérifier que les insights contiennent les bonnes informations
      const insightTexts = result.insights.join(' ');
      expect(insightTexts).toContain('confiance');
      expect(insightTexts).toContain('Progression');
      expect(insightTexts).toContain('Fréquence');
    });

    test('devrait avoir des insights appropriés pour une progression positive', () => {
      const result = getProgressionInsights('Pompes', mockWorkouts);
      
      const hasPositiveTrend = result.insights.some(insight => 
        insight.includes('positive') || insight.includes('📈')
      );
      expect(hasPositiveTrend).toBe(true);
    });

    test('devrait avoir des insights appropriés pour une fréquence élevée', () => {
      const result = getProgressionInsights('Pompes', mockWorkouts);
      
      const hasFrequencyInsight = result.insights.some(insight => 
        insight.includes('Fréquence') || insight.includes('🔥') || insight.includes('💪')
      );
      expect(hasFrequencyInsight).toBe(true);
    });
  });

  describe('analyzeAllExercises', () => {
    test('devrait analyser tous les exercices', () => {
      const result = analyzeAllExercises(mockWorkouts);
      
      expect(result).toBeInstanceOf(Object);
      expect(Object.keys(result)).toContain('Pompes');
      expect(Object.keys(result)).toContain('Squats');
      expect(Object.keys(result).length).toBe(2);
    });

    test('devrait gérer les exercices cardio', () => {
      const result = analyzeAllExercises(mockWorkoutsWithCardio);
      
      // Les exercices cardio peuvent être inclus mais sans prédiction de poids
      expect(typeof result).toBe('object');
    });

    test('devrait avoir des analyses valides pour chaque exercice', () => {
      const result = analyzeAllExercises(mockWorkouts);
      
      Object.values(result).forEach(analysis => {
        expect(analysis).toHaveProperty('predictedWeight');
        expect(analysis).toHaveProperty('confidence');
        expect(analysis).toHaveProperty('trend');
        expect(analysis).toHaveProperty('insights');
        expect(analysis.insights).toBeInstanceOf(Array);
      });
    });

    test('devrait retourner un objet vide pour des workouts vides', () => {
      const result = analyzeAllExercises([]);
      
      expect(result).toEqual({});
    });
  });

  describe('Cas limites et edge cases', () => {
    test('devrait gérer un seul workout', () => {
      const singleWorkout = [mockWorkouts[0]];
      const result = predictNextWeight('Pompes', singleWorkout);
      
      expect(result.confidence).toBeLessThan(50); // Faible confiance avec peu de données
    });

    test('devrait gérer des poids identiques (progression nulle)', () => {
      const staticWorkouts = [
        {
          date: '2025-01-01',
          exercises: [{ name: 'Pompes', sets: [{ weight: 50, reps: 10 }] }],
        },
        {
          date: '2025-01-03',
          exercises: [{ name: 'Pompes', sets: [{ weight: 50, reps: 10 }] }],
        },
      ];
      
      const result = predictNextWeight('Pompes', staticWorkouts);
      
      expect(result.progression).toBe(0);
      expect(result.trend).toBe('stable');
    });

    test('devrait gérer des poids décroissants', () => {
      const decreasingWorkouts = [
        {
          date: '2025-01-01',
          exercises: [{ name: 'Pompes', sets: [{ weight: 60, reps: 10 }] }],
        },
        {
          date: '2025-01-03',
          exercises: [{ name: 'Pompes', sets: [{ weight: 55, reps: 10 }] }],
        },
      ];
      
      const result = predictNextWeight('Pompes', decreasingWorkouts);
      
      // Avec seulement 2 sessions, la tendance peut être stable
      expect(['decreasing', 'stable']).toContain(result.trend);
      expect(result.predictedWeight).toBeLessThanOrEqual(60);
    });

    test('devrait limiter les prédictions à +20% du dernier poids', () => {
      const result = predictNextWeight('Pompes', mockWorkouts);
      const maxAllowedWeight = 65 * 1.2; // +20% du dernier poids
      
      expect(result.predictedWeight).toBeLessThanOrEqual(maxAllowedWeight);
    });

    test('devrait calculer correctement le niveau de confiance', () => {
      const result = predictNextWeight('Pompes', mockWorkouts);
      
      // Avec 5 sessions, la confiance devrait être élevée
      expect(result.confidence).toBeGreaterThan(40);
      expect(result.confidence).toBeLessThanOrEqual(90);
    });
  });

  describe('Validation des recommandations', () => {
    test('devrait avoir des recommandations appropriées', () => {
      const result = predictNextWeight('Pompes', mockWorkouts);
      
      expect(result.recommendation).toMatch(/Essayez|Maintenez/);
      expect(result.recommendation).toContain('kg');
    });

    test('devrait avoir des facteurs d\'ajustement appropriés', () => {
      const result = predictNextWeight('Pompes', mockWorkouts);
      
      expect(result.factors).toBeInstanceOf(Array);
      result.factors.forEach(factor => {
        expect(typeof factor).toBe('string');
        expect(factor.length).toBeGreaterThan(0);
      });
    });
  });
}); 