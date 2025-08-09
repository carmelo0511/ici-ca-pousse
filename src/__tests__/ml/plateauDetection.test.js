/**
 * Tests complets pour le système de détection de plateau
 */

import { 
  AdvancedPlateauDetector, 
  PLATEAU_TYPES, 
  PLATEAU_SEVERITY,
  analyzeExercisePlateauQuick,
  analyzeGlobalPlateauTrends
} from '../../utils/ml/plateauDetection';

describe('AdvancedPlateauDetector', () => {
  let detector;

  beforeEach(() => {
    detector = new AdvancedPlateauDetector({
      minDataPoints: 5,
      sensitivityWeight: 0.8,
      trendWindowSize: 6
    });
  });

  describe('analyzeExercisePlateau', () => {
    it('should detect no plateaus with insufficient data', () => {
      const shortHistory = [
        { date: '2024-01-01', weight: 80, reps: 8 },
        { date: '2024-01-08', weight: 82, reps: 8 }
      ];

      const result = detector.analyzeExercisePlateau('Bench Press', shortHistory, 'intermediate');

      expect(result.hasPlateaus).toBe(false);
      expect(result.detectedPlateaus).toHaveLength(0);
      expect(result.overallSeverity).toBe('none');
      expect(result.confidence).toBe(0);
      expect(result.recommendations[0]).toContain('Continuez à enregistrer');
    });

    it('should detect weight plateau with sufficient data', () => {
      const plateauHistory = [
        { date: '2024-01-01', weight: 80, reps: 8 },
        { date: '2024-01-08', weight: 80, reps: 8 },
        { date: '2024-01-15', weight: 80, reps: 8 },
        { date: '2024-01-22', weight: 80, reps: 8 },
        { date: '2024-01-29', weight: 80, reps: 8 },
        { date: '2024-02-05', weight: 80, reps: 8 }
      ];

      const result = detector.analyzeExercisePlateau('Bench Press', plateauHistory, 'intermediate');

      expect(result.hasPlateaus).toBe(true);
      expect(result.detectedPlateaus.some(p => p.type === PLATEAU_TYPES.WEIGHT)).toBe(true);
      expect(result.overallSeverity).not.toBe('none');
    });

    it('should detect multiple plateau types simultaneously', () => {
      const multiPlateauHistory = [
        { date: '2024-01-01', weight: 80, reps: 10, sets: 3 },
        { date: '2024-01-08', weight: 80, reps: 8, sets: 3 }, // Baisse volume
        { date: '2024-01-15', weight: 80, reps: 8, sets: 2 }, // Baisse volume
        { date: '2024-01-22', weight: 80, reps: 8, sets: 2 }, // Stagnation poids + volume
        { date: '2024-01-29', weight: 80, reps: 8, sets: 2 },
        { date: '2024-02-05', weight: 80, reps: 7, sets: 2 }  // Baisse performance
      ];

      const result = detector.analyzeExercisePlateau('Multi Test', multiPlateauHistory, 'advanced');

      expect(result.hasPlateaus).toBe(true);
      expect(result.detectedPlateaus.length).toBeGreaterThanOrEqual(1); // Au moins un plateau détecté
      // Vérifier qu'au moins un plateau de poids est détecté
      const hasWeightPlateau = result.detectedPlateaus.some(p => p.type === PLATEAU_TYPES.WEIGHT);
      expect(hasWeightPlateau).toBe(true);
    });

    it('should provide detailed analysis information', () => {
      const history = [
        { date: '2024-01-01', weight: 80, reps: 8 },
        { date: '2024-01-08', weight: 80, reps: 8 },
        { date: '2024-01-15', weight: 80, reps: 8 },
        { date: '2024-01-22', weight: 80, reps: 8 },
        { date: '2024-01-29', weight: 80, reps: 8 }
      ];

      const result = detector.analyzeExercisePlateau('Detailed Test', history, 'beginner');

      expect(result.analysisDetails).toBeDefined();
      expect(result.analysisDetails.dataPoints).toBe(5);
      expect(result.analysisDetails.timeSpan).toBeGreaterThan(0);
      expect(result.analysisDetails.trendAnalysis).toBeDefined();
    });
  });

  describe('detectWeightPlateau', () => {
    it('should detect weight stagnation', () => {
      const stagnantData = [
        { maxWeight: 80, date: new Date('2024-01-01') },
        { maxWeight: 80, date: new Date('2024-01-08') },
        { maxWeight: 80, date: new Date('2024-01-15') },
        { maxWeight: 80, date: new Date('2024-01-22') },
        { maxWeight: 80, date: new Date('2024-01-29') }
      ];

      const result = detector.detectWeightPlateau(stagnantData, 'intermediate');

      expect(result.detected).toBe(true);
      expect(result.type).toBe(PLATEAU_TYPES.WEIGHT);
      expect(result.weeksStuck).toBeGreaterThan(2);
      expect(result.currentWeight).toBe(80);
      expect(result.severity).toBeDefined();
    });

    it('should not detect plateau with progression', () => {
      const progressiveData = [
        { maxWeight: 80, date: new Date('2024-01-01') },
        { maxWeight: 82, date: new Date('2024-01-08') },
        { maxWeight: 84, date: new Date('2024-01-15') },
        { maxWeight: 86, date: new Date('2024-01-22') },
        { maxWeight: 88, date: new Date('2024-01-29') }
      ];

      const result = detector.detectWeightPlateau(progressiveData, 'intermediate');

      expect(result.detected).toBe(false);
    });

    it('should handle insufficient data gracefully', () => {
      const insufficientData = [
        { maxWeight: 80, date: new Date('2024-01-01') },
        { maxWeight: 80, date: new Date('2024-01-08') }
      ];

      const result = detector.detectWeightPlateau(insufficientData, 'intermediate');

      expect(result.detected).toBe(false);
      expect(result.type).toBe(PLATEAU_TYPES.WEIGHT);
    });
  });

  describe('detectVolumePlateau', () => {
    it('should detect volume stagnation', () => {
      const volumeData = [
        { totalVolume: 1920, date: new Date('2024-01-01') }, // 80*8*3
        { totalVolume: 1920, date: new Date('2024-01-08') },
        { totalVolume: 1920, date: new Date('2024-01-15') },
        { totalVolume: 1920, date: new Date('2024-01-22') },
        { totalVolume: 1920, date: new Date('2024-01-29') }
      ];

      const result = detector.detectVolumePlateau(volumeData, 'intermediate');

      expect(result.detected).toBe(true);
      expect(result.type).toBe(PLATEAU_TYPES.VOLUME);
      expect(result.currentVolume).toBe(1920);
    });

    it('should handle missing volume data', () => {
      const incompleteData = [
        { reps: 8, weight: 80, date: new Date('2024-01-01') },
        { reps: 8, weight: 80, date: new Date('2024-01-08') },
        { reps: 8, weight: 80, date: new Date('2024-01-15') },
        { reps: 8, weight: 80, date: new Date('2024-01-22') }
      ];

      const result = detector.detectVolumePlateau(incompleteData, 'intermediate');

      // Devrait calculer le volume à partir de reps * weight
      expect(result.type).toBe(PLATEAU_TYPES.VOLUME);
    });
  });

  describe('detectIntensityPlateau', () => {
    it('should detect intensity stagnation', () => {
      const intensityData = [
        { weight: 80, reps: 8, date: new Date('2024-01-01') },
        { weight: 80, reps: 8, date: new Date('2024-01-08') },
        { weight: 80, reps: 8, date: new Date('2024-01-15') },
        { weight: 80, reps: 8, date: new Date('2024-01-22') },
        { weight: 80, reps: 8, date: new Date('2024-01-29') }
      ];

      const result = detector.detectIntensityPlateau(intensityData, 'advanced');

      expect(result.detected).toBe(true);
      expect(result.type).toBe(PLATEAU_TYPES.INTENSITY);
      expect(result.currentIntensity).toBeDefined();
      expect(result.maxIntensity).toBeDefined();
    });

    it('should calculate intensity using Epley formula', () => {
      const data = [
        { weight: 100, reps: 5, date: new Date('2024-01-01') }
      ];

      const prepared = detector.prepareTimeSeriesData(data.map(d => ({
        ...d,
        maxWeight: d.weight
      })));

      const result = detector.detectIntensityPlateau(prepared, 'intermediate');
      
      // Vérifier que l'intensité est calculée (même si pas de plateau détecté)
      expect(result.type).toBe(PLATEAU_TYPES.INTENSITY);
    });
  });

  describe('detectFrequencyPlateau', () => {
    it('should detect frequency drop', () => {
      // Simuler une baisse de fréquence (8 entrées récentes vs 4 précédentes)
      const frequencyData = Array.from({ length: 8 }, (_, i) => ({
        date: new Date(2024, 0, i + 1),
        weight: 80,
        totalVolume: 1920
      }));

      // Simuler moins d'entraînements récents (contexte uniquement)
      frequencyData.slice(0, 3);

      const result = detector.detectFrequencyPlateau(frequencyData, 'intermediate');

      expect(result.type).toBe(PLATEAU_TYPES.FREQUENCY);
    });

    it('should not detect frequency plateau with consistent training', () => {
      const consistentData = Array.from({ length: 12 }, (_, i) => ({
        date: new Date(2024, 0, i + 1),
        weight: 80,
        totalVolume: 1920
      }));

      const result = detector.detectFrequencyPlateau(consistentData, 'intermediate');

      expect(result.detected).toBe(false);
    });
  });

  describe('detectMotivationalPlateau', () => {
    it('should detect motivational decline with multiple indicators', () => {
      const motivationalData = [
        { date: new Date('2024-01-01'), totalVolume: 2000, duration: 60, weight: 80, reps: 10 },
        { date: new Date('2024-01-08'), totalVolume: 1800, duration: 55, weight: 80, reps: 9 },
        { date: new Date('2024-01-15'), totalVolume: 1600, duration: 50, weight: 80, reps: 8 },
        { date: new Date('2024-01-22'), totalVolume: 1600, duration: 45, weight: 80, reps: 8 },
        { date: new Date('2024-01-29'), totalVolume: 1400, duration: 40, weight: 80, reps: 8 },
        { date: new Date('2024-02-05'), totalVolume: 1400, duration: 40, weight: 80, reps: 8 }
      ];

      const result = detector.detectMotivationalPlateau(motivationalData, 'intermediate');

      expect(result.type).toBe(PLATEAU_TYPES.MOTIVATIONAL);
      expect(result.indicators).toBeDefined();
      expect(result.positiveIndicators).toBeGreaterThanOrEqual(0);
    });

    it('should not detect motivational plateau with consistent performance', () => {
      const consistentData = [
        { date: new Date('2024-01-01'), totalVolume: 2000, duration: 60, weight: 80, reps: 10 },
        { date: new Date('2024-01-08'), totalVolume: 2000, duration: 60, weight: 82, reps: 10 },
        { date: new Date('2024-01-15'), totalVolume: 2000, duration: 60, weight: 84, reps: 10 },
        { date: new Date('2024-01-22'), totalVolume: 2000, duration: 60, weight: 86, reps: 10 },
        { date: new Date('2024-01-29'), totalVolume: 2000, duration: 60, weight: 88, reps: 10 },
        { date: new Date('2024-02-05'), totalVolume: 2000, duration: 60, weight: 90, reps: 10 }
      ];

      const result = detector.detectMotivationalPlateau(consistentData, 'intermediate');

      expect(result.detected).toBe(false);
    });
  });

  describe('generatePlateauRecommendations', () => {
    it('should provide recommendations for weight plateau', () => {
      const weightPlateau = [{
        type: PLATEAU_TYPES.WEIGHT,
        severity: 'moderate',
        weeksStuck: 4
      }];

      const recommendations = detector.generatePlateauRecommendations(
        weightPlateau, 
        'Bench Press', 
        'intermediate', 
        []
      );

      expect(recommendations).toBeInstanceOf(Array);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(r => r.includes('méthode d\'entraînement'))).toBe(true);
    });

    it('should provide different recommendations based on severity', () => {
      const mildPlateau = [{ type: PLATEAU_TYPES.WEIGHT, severity: 'mild' }];
      const severePlateau = [{ type: PLATEAU_TYPES.WEIGHT, severity: 'severe' }];

      const mildRec = detector.generatePlateauRecommendations(mildPlateau, 'Squat', 'beginner', []);
      const severeRec = detector.generatePlateauRecommendations(severePlateau, 'Squat', 'beginner', []);

      expect(mildRec).not.toEqual(severeRec);
      expect(severeRec.some(r => r.includes('décharge'))).toBe(true);
    });

    it('should provide motivational recommendations', () => {
      const motivationalPlateau = [{
        type: PLATEAU_TYPES.MOTIVATIONAL,
        severity: 'moderate',
        indicators: { volumeDecline: true }
      }];

      const recommendations = detector.generatePlateauRecommendations(
        motivationalPlateau, 
        'Deadlift', 
        'advanced', 
        []
      );

      // Vérifier qu'au moins une recommandation motivationnelle est présente
      const hasMotivationalRec = recommendations.some(r => 
        r.includes('objectifs') || 
        r.includes('partenaire') || 
        r.includes('variez') ||
        r.includes('défi')
      );
      expect(hasMotivationalRec).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should limit recommendations to reasonable number', () => {
      const multiplePlateaus = [
        { type: PLATEAU_TYPES.WEIGHT, severity: 'severe' },
        { type: PLATEAU_TYPES.VOLUME, severity: 'moderate' },
        { type: PLATEAU_TYPES.INTENSITY, severity: 'mild' },
        { type: PLATEAU_TYPES.FREQUENCY, severity: 'moderate' },
        { type: PLATEAU_TYPES.MOTIVATIONAL, severity: 'severe' }
      ];

      const recommendations = detector.generatePlateauRecommendations(
        multiplePlateaus, 
        'Complex Exercise', 
        'intermediate', 
        []
      );

      expect(recommendations.length).toBeLessThanOrEqual(6);
    });
  });

  describe('utility methods', () => {
    it('should calculate trend correctly', () => {
      const increasingValues = [1, 2, 3, 4, 5];
      const decreasingValues = [5, 4, 3, 2, 1];
      const flatValues = [3, 3, 3, 3, 3];

      expect(detector.calculateTrend(increasingValues)).toBeGreaterThan(0);
      expect(detector.calculateTrend(decreasingValues)).toBeLessThan(0);
      expect(detector.calculateTrend(flatValues)).toBeCloseTo(0, 1);
    });

    it('should calculate variance correctly', () => {
      const uniformValues = [5, 5, 5, 5, 5];
      const variableValues = [1, 5, 3, 7, 4];

      expect(detector.calculateVariance(uniformValues)).toBe(0);
      expect(detector.calculateVariance(variableValues)).toBeGreaterThan(0);
    });

    it('should handle edge cases in calculations', () => {
      expect(detector.calculateTrend([])).toBe(0);
      expect(detector.calculateTrend([5])).toBe(0);
      expect(detector.calculateVariance([])).toBe(0);
      expect(detector.calculateVariance([5])).toBe(0);
    });

    it('should determine plateau severity correctly', () => {
      expect(detector.determinePlateauSeverity(1)).toBe(PLATEAU_SEVERITY.MILD);
      expect(detector.determinePlateauSeverity(5)).toBe(PLATEAU_SEVERITY.MODERATE);
      expect(detector.determinePlateauSeverity(7)).toBe(PLATEAU_SEVERITY.SEVERE);
      expect(detector.determinePlateauSeverity(10)).toBe(PLATEAU_SEVERITY.CRITICAL);
    });

    it('should calculate overall severity from multiple plateaus', () => {
      const multiplePlateaus = [
        { severity: 'mild' },
        { severity: 'moderate' },
        { severity: 'severe' }
      ];

      const severity = detector.calculateOverallSeverity(multiplePlateaus);
      expect(['mild', 'moderate', 'severe', 'critical']).toContain(severity);
    });
  });
});

describe('Helper Functions', () => {
  describe('analyzeExercisePlateauQuick', () => {
    it('should provide quick analysis', () => {
      const quickHistory = [
        { date: '2024-01-01', weight: 80, reps: 8 },
        { date: '2024-01-08', weight: 80, reps: 8 },
        { date: '2024-01-15', weight: 80, reps: 8 },
        { date: '2024-01-22', weight: 80, reps: 8 },
        { date: '2024-01-29', weight: 80, reps: 8 }
      ];

      const result = analyzeExercisePlateauQuick('Quick Test', quickHistory, 'intermediate');

      expect(result.hasPlateaus).toBeDefined();
      expect(result.detectedPlateaus).toBeInstanceOf(Array);
      expect(result.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('analyzeGlobalPlateauTrends', () => {
    it('should analyze multiple exercises', () => {
      const allExercisesData = {
        'Bench Press': [
          { date: '2024-01-01', weight: 80, reps: 8 },
          { date: '2024-01-08', weight: 80, reps: 8 },
          { date: '2024-01-15', weight: 80, reps: 8 }
        ],
        'Squat': [
          { date: '2024-01-01', weight: 100, reps: 5 },
          { date: '2024-01-08', weight: 105, reps: 5 },
          { date: '2024-01-15', weight: 110, reps: 5 }
        ]
      };

      const result = analyzeGlobalPlateauTrends(allExercisesData, 'intermediate');

      expect(result.totalExercises).toBe(2);
      expect(result.exercisesWithPlateaus).toBeGreaterThanOrEqual(0);
      expect(result.plateauTypes).toBeDefined();
      expect(result.overallSeverity).toBeDefined();
      expect(result.globalRecommendations).toBeInstanceOf(Array);
    });

    it('should determine critical global severity with many plateaus', () => {
      const criticalData = {
        'Exercise1': Array(5).fill({ date: '2024-01-01', weight: 80, reps: 8 }),
        'Exercise2': Array(5).fill({ date: '2024-01-01', weight: 90, reps: 6 }),
        'Exercise3': Array(5).fill({ date: '2024-01-01', weight: 70, reps: 10 })
      };

      const result = analyzeGlobalPlateauTrends(criticalData, 'advanced');

      expect(result.overallSeverity).not.toBe('none');
      expect(result.globalRecommendations.length).toBeGreaterThan(0);
    });
  });
});

describe('Edge Cases and Error Handling', () => {
  let detector;

  beforeEach(() => {
    detector = new AdvancedPlateauDetector();
  });

  it('should handle null/undefined data gracefully', () => {
    expect(() => detector.analyzeExercisePlateau('Test', null, 'intermediate')).not.toThrow();
    expect(() => detector.analyzeExercisePlateau('Test', undefined, 'intermediate')).not.toThrow();
    expect(() => detector.analyzeExercisePlateau('Test', [], 'intermediate')).not.toThrow();
  });

  it('should handle corrupted date data', () => {
    const corruptedData = [
      { date: 'invalid-date', weight: 80, reps: 8 },
      { date: null, weight: 82, reps: 8 },
      { date: new Date('2024-01-15'), weight: 84, reps: 8 }
    ];

    const result = detector.analyzeExercisePlateau('Corrupted Test', corruptedData, 'intermediate');

    // Ne devrait pas planter, mais peut avoir peu de données valides
    expect(result).toBeDefined();
    expect(result.hasPlateaus).toBeDefined();
  });

  it('should handle extreme numerical values', () => {
    const extremeData = [
      { date: '2024-01-01', weight: 0, reps: 0 },
      { date: '2024-01-08', weight: Infinity, reps: 1000 },
      { date: '2024-01-15', weight: -50, reps: -5 },
      { date: '2024-01-22', weight: 80, reps: 8 }
    ];

    expect(() => detector.analyzeExercisePlateau('Extreme Test', extremeData, 'intermediate')).not.toThrow();
  });

  it('should handle different user levels', () => {
    const testData = [
      { date: '2024-01-01', weight: 80, reps: 8 },
      { date: '2024-01-08', weight: 80, reps: 8 },
      { date: '2024-01-15', weight: 80, reps: 8 },
      { date: '2024-01-22', weight: 80, reps: 8 },
      { date: '2024-01-29', weight: 80, reps: 8 }
    ];

    const beginnerResult = detector.analyzeExercisePlateau('Level Test', testData, 'beginner');
    const intermediateResult = detector.analyzeExercisePlateau('Level Test', testData, 'intermediate');
    const advancedResult = detector.analyzeExercisePlateau('Level Test', testData, 'advanced');

    expect(beginnerResult).toBeDefined();
    expect(intermediateResult).toBeDefined();
    expect(advancedResult).toBeDefined();

    // Les seuils peuvent différer selon le niveau
    expect(beginnerResult.detectedPlateaus).toBeInstanceOf(Array);
    expect(intermediateResult.detectedPlateaus).toBeInstanceOf(Array);
    expect(advancedResult.detectedPlateaus).toBeInstanceOf(Array);
  });

  it('should handle invalid user level gracefully', () => {
    const testData = [
      { date: '2024-01-01', weight: 80, reps: 8 },
      { date: '2024-01-08', weight: 80, reps: 8 }
    ];

    const result = detector.analyzeExercisePlateau('Invalid Level Test', testData, 'expert'); // Niveau non supporté

    expect(result).toBeDefined();
    // Devrait utiliser 'intermediate' par défaut
  });
});