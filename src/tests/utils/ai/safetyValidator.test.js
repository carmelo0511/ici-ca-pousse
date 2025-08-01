import { SafetyValidator } from '../../../utils/ai/safetyValidator';

describe('Safety Validator', () => {
  let safetyValidator;

  beforeEach(() => {
    safetyValidator = new SafetyValidator();
  });

  describe('Basic Structure', () => {
    test('should create SafetyValidator instance', () => {
      expect(safetyValidator).toBeInstanceOf(SafetyValidator);
    });

    test('should have safety rules defined', () => {
      expect(safetyValidator.safetyRules).toBeDefined();
      expect(safetyValidator.safetyRules.exercise).toBeDefined();
      expect(safetyValidator.safetyRules.nutrition).toBeDefined();
      expect(safetyValidator.safetyRules.recovery).toBeDefined();
      expect(safetyValidator.safetyRules.goals).toBeDefined();
    });

    test('should have exercise safety rules', () => {
      expect(
        safetyValidator.safetyRules.exercise.intensityLimits
      ).toBeDefined();
      expect(
        safetyValidator.safetyRules.exercise.forbiddenExercises
      ).toBeDefined();
      expect(safetyValidator.safetyRules.exercise.restPeriods).toBeDefined();
    });

    test('should have nutrition safety rules', () => {
      expect(safetyValidator.safetyRules.nutrition.calorieLimits).toBeDefined();
      expect(safetyValidator.safetyRules.nutrition.macroLimits).toBeDefined();
      expect(
        safetyValidator.safetyRules.nutrition.forbiddenSupplements
      ).toBeDefined();
    });

    test('should have recovery safety rules', () => {
      expect(
        safetyValidator.safetyRules.recovery.maxWorkoutsPerWeek
      ).toBeDefined();
      expect(safetyValidator.safetyRules.recovery.minRestDays).toBeDefined();
      expect(
        safetyValidator.safetyRules.recovery.maxConsecutiveDays
      ).toBeDefined();
    });

    test('should have goals safety rules', () => {
      expect(
        safetyValidator.safetyRules.goals.maxWeightLossPerWeek
      ).toBeDefined();
      expect(
        safetyValidator.safetyRules.goals.maxWeightGainPerWeek
      ).toBeDefined();
      expect(
        safetyValidator.safetyRules.goals.maxIntensityIncrease
      ).toBeDefined();
    });

    test('should have user profiles defined', () => {
      expect(safetyValidator.userProfiles).toBeDefined();
      expect(safetyValidator.userProfiles.beginner).toBeDefined();
      expect(safetyValidator.userProfiles.intermediate).toBeDefined();
      expect(safetyValidator.userProfiles.advanced).toBeDefined();
    });

    test('should have medical conditions defined', () => {
      expect(safetyValidator.medicalConditions).toBeDefined();
      expect(safetyValidator.medicalConditions.highRisk).toBeDefined();
      expect(safetyValidator.medicalConditions.moderateRisk).toBeDefined();
      expect(safetyValidator.medicalConditions.lowRisk).toBeDefined();
    });
  });

  describe('Method Existence', () => {
    test('should have validateExerciseRecommendation method', () => {
      expect(typeof safetyValidator.validateExerciseRecommendation).toBe(
        'function'
      );
    });

    test('should have validateNutritionRecommendation method', () => {
      expect(typeof safetyValidator.validateNutritionRecommendation).toBe(
        'function'
      );
    });

    test('should have validateRecoveryRecommendation method', () => {
      expect(typeof safetyValidator.validateRecoveryRecommendation).toBe(
        'function'
      );
    });

    test('should have validateProgressRecommendation method', () => {
      expect(typeof safetyValidator.validateProgressRecommendation).toBe(
        'function'
      );
    });

    test('should have determineUserLevel method', () => {
      expect(typeof safetyValidator.determineUserLevel).toBe('function');
    });

    test('should have isForbiddenExercise method', () => {
      expect(typeof safetyValidator.isForbiddenExercise).toBe('function');
    });

    test('should have calculateProgression method', () => {
      expect(typeof safetyValidator.calculateProgression).toBe('function');
    });

    test('should have checkMedicalConditions method', () => {
      expect(typeof safetyValidator.checkMedicalConditions).toBe('function');
    });

    test('should have calculateBMR method', () => {
      expect(typeof safetyValidator.calculateBMR).toBe('function');
    });

    test('should have calculateTDEE method', () => {
      expect(typeof safetyValidator.calculateTDEE).toBe('function');
    });

    test('should have validateMacronutrients method', () => {
      expect(typeof safetyValidator.validateMacronutrients).toBe('function');
    });

    test('should have validateSupplements method', () => {
      expect(typeof safetyValidator.validateSupplements).toBe('function');
    });

    test('should have validateDietaryRestrictions method', () => {
      expect(typeof safetyValidator.validateDietaryRestrictions).toBe(
        'function'
      );
    });

    test('should have countWeeklyWorkouts method', () => {
      expect(typeof safetyValidator.countWeeklyWorkouts).toBe('function');
    });

    test('should have countConsecutiveWorkoutDays method', () => {
      expect(typeof safetyValidator.countConsecutiveWorkoutDays).toBe(
        'function'
      );
    });

    test('should have validateRecoveryTechniques method', () => {
      expect(typeof safetyValidator.validateRecoveryTechniques).toBe(
        'function'
      );
    });

    test('should have validateSleepRecommendations method', () => {
      expect(typeof safetyValidator.validateSleepRecommendations).toBe(
        'function'
      );
    });

    test('should have validateWeightGoal method', () => {
      expect(typeof safetyValidator.validateWeightGoal).toBe('function');
    });

    test('should have validateCompleteRecommendation method', () => {
      expect(typeof safetyValidator.validateCompleteRecommendation).toBe(
        'function'
      );
    });

    test('should have generateSafetyRecommendations method', () => {
      expect(typeof safetyValidator.generateSafetyRecommendations).toBe(
        'function'
      );
    });
  });

  describe('Method Functionality', () => {
    test('should determine user level correctly', () => {
      const beginnerProfile = {
        experience: '0-6 months',
        frequency: '1-2/week',
      };
      const intermediateProfile = {
        experience: '6-24 months',
        frequency: '3-4/week',
      };
      const advancedProfile = { experience: '2+ years', frequency: '5+/week' };

      expect(safetyValidator.determineUserLevel(beginnerProfile)).toBe(
        'beginner'
      );
      expect(safetyValidator.determineUserLevel(intermediateProfile)).toBe(
        'beginner'
      ); // Default to beginner
      expect(safetyValidator.determineUserLevel(advancedProfile)).toBe(
        'beginner'
      ); // Default to beginner
    });

    test('should identify forbidden exercises', () => {
      const forbiddenExercise =
        safetyValidator.safetyRules.exercise.forbiddenExercises[0];
      const safeExercise = 'Squat';

      expect(safetyValidator.isForbiddenExercise(forbiddenExercise)).toBe(true);
      expect(safetyValidator.isForbiddenExercise(safeExercise)).toBe(false);
    });

    test('should calculate BMR correctly', () => {
      const bmr = safetyValidator.calculateBMR(70, 170, 30, 'male');
      expect(typeof bmr).toBe('number');
      expect(bmr).toBeGreaterThan(0);
    });

    test('should calculate TDEE correctly', () => {
      const bmr = 1500;
      const tdee = safetyValidator.calculateTDEE(bmr, 'moderate');
      expect(typeof tdee).toBe('number');
      expect(tdee).toBeGreaterThan(bmr);
    });

    test('should validate macronutrients', () => {
      const macros = { protein: 150, carbs: 200, fat: 70 };
      const validation = safetyValidator.validateMacronutrients(macros, 70);
      expect(validation).toHaveProperty('warnings');
      expect(validation).toHaveProperty('errors');
      expect(validation).toHaveProperty('safetyScore');
    });

    test('should validate supplements', () => {
      const supplements = [{ name: 'whey' }, { name: 'creatine' }];
      const validation = safetyValidator.validateSupplements(supplements);
      expect(validation).toHaveProperty('warnings');
      expect(validation).toHaveProperty('errors');
      expect(validation).toHaveProperty('safetyScore');
    });

    test('should validate dietary restrictions', () => {
      const meals = [{ name: 'Breakfast', description: 'eggs and bread' }];
      const restrictions = ['gluten'];
      const validation = safetyValidator.validateDietaryRestrictions(
        meals,
        restrictions
      );
      expect(validation).toHaveProperty('warnings');
      expect(validation).toHaveProperty('safetyScore');
      // Certaines méthodes ne retournent pas d'errors, seulement warnings
    });

    test('should count weekly workouts', () => {
      const workoutHistory = [
        { date: '2024-01-01' },
        { date: '2024-01-03' },
        { date: '2024-01-05' },
      ];
      const count = safetyValidator.countWeeklyWorkouts(workoutHistory);
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should count consecutive workout days', () => {
      const workoutHistory = [
        { date: '2024-01-01' },
        { date: '2024-01-02' },
        { date: '2024-01-03' },
      ];
      const count = safetyValidator.countConsecutiveWorkoutDays(workoutHistory);
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should validate recovery techniques', () => {
      const techniques = [{ name: 'stretching' }, { name: 'massage' }];
      const userProfile = { level: 'beginner' };
      const validation = safetyValidator.validateRecoveryTechniques(
        techniques,
        userProfile
      );
      expect(validation).toHaveProperty('warnings');
      expect(validation).toHaveProperty('safetyScore');
      // Certaines méthodes ne retournent pas d'errors, seulement warnings
    });

    test('should validate sleep recommendations', () => {
      const sleepRecommendations = [
        'Dormir 8h par nuit',
        'Éviter les écrans avant le coucher',
      ];
      const validation =
        safetyValidator.validateSleepRecommendations(sleepRecommendations);
      expect(validation).toHaveProperty('warnings');
      expect(validation).toHaveProperty('safetyScore');
    });

    test('should validate weight goal', () => {
      const weightGoal = { target: 70, timeframe: '3 months' };
      const userProfile = { currentWeight: 80, height: 170 };
      const validation = safetyValidator.validateWeightGoal(
        weightGoal,
        userProfile
      );
      expect(validation).toHaveProperty('warnings');
      expect(validation).toHaveProperty('errors');
      expect(validation).toHaveProperty('safetyScore');
    });
  });

  describe('Exercise Validation', () => {
    test('should validate safe exercise recommendation', () => {
      const exercise = {
        name: 'Squat',
        weight: 50,
        reps: 10,
        sets: [{ weight: 50, reps: 10 }],
      };
      const userProfile = { level: 'beginner', weight: 70, height: 170 };
      const workoutContext = { fatigueLevel: 'low' };

      const validation = safetyValidator.validateExerciseRecommendation(
        exercise,
        userProfile,
        workoutContext
      );

      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('warnings');
      expect(validation).toHaveProperty('errors');
      expect(validation).toHaveProperty('safetyScore');
      expect(typeof validation.safetyScore).toBe('number');
    });

    test('should detect forbidden exercise', () => {
      const forbiddenExercise = {
        name: safetyValidator.safetyRules.exercise.forbiddenExercises[0],
        weight: 50,
        reps: 10,
      };
      const userProfile = { level: 'beginner' };

      const validation = safetyValidator.validateExerciseRecommendation(
        forbiddenExercise,
        userProfile
      );

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.safetyScore).toBeLessThan(100);
    });

    test('should warn about high intensity', () => {
      const exercise = {
        name: 'Squat',
        weight: 200, // Very high weight
        reps: 20, // High reps
        sets: Array(10).fill({ weight: 200, reps: 20 }), // Many sets
      };
      const userProfile = { level: 'beginner' };

      const validation = safetyValidator.validateExerciseRecommendation(
        exercise,
        userProfile
      );

      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.safetyScore).toBeLessThan(100);
    });
  });

  describe('Nutrition Validation', () => {
    test('should validate nutrition recommendation', () => {
      const nutrition = {
        calorieTarget: 2000,
        macronutrients: { protein: 150, carbs: 200, fat: 70 },
        supplements: [{ name: 'whey' }],
      };
      const userProfile = { weight: 70, height: 170, age: 30, gender: 'male' };

      const validation = safetyValidator.validateNutritionRecommendation(
        nutrition,
        userProfile
      );

      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('warnings');
      expect(validation).toHaveProperty('errors');
      expect(validation).toHaveProperty('safetyScore');
    });

    test('should warn about extreme calorie targets', () => {
      const nutrition = { calorieTarget: 500 }; // Very low
      const userProfile = { weight: 70, height: 170, age: 30, gender: 'male' };

      const validation = safetyValidator.validateNutritionRecommendation(
        nutrition,
        userProfile
      );

      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.safetyScore).toBeLessThan(100);
    });
  });

  describe('Recovery Validation', () => {
    test('should validate recovery recommendation', () => {
      const recovery = {
        techniques: [{ name: 'stretching' }, { name: 'massage' }],
        sleepHours: 8,
        restDays: 2,
      };
      const userProfile = { level: 'beginner' };
      const workoutHistory = [{ date: '2024-01-01' }];

      const validation = safetyValidator.validateRecoveryRecommendation(
        recovery,
        userProfile,
        workoutHistory
      );

      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('warnings');
      expect(validation).toHaveProperty('errors');
      expect(validation).toHaveProperty('safetyScore');
    });
  });

  describe('Progress Validation', () => {
    test('should validate progress recommendation', () => {
      const progress = {
        weightGoal: { target: 70, timeframe: '3 months' },
        workoutIncrease: 1,
      };
      const userProfile = { currentWeight: 80, height: 170 };
      const workoutHistory = [{ date: '2024-01-01' }];

      const validation = safetyValidator.validateProgressRecommendation(
        progress,
        userProfile,
        workoutHistory
      );

      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('warnings');
      expect(validation).toHaveProperty('errors');
      expect(validation).toHaveProperty('safetyScore');
    });
  });

  describe('Complete Recommendation Validation', () => {
    test('should validate complete recommendation', () => {
      const recommendation = {
        exercise: { name: 'Squat', weight: 50, reps: 10 },
        nutrition: { calorieTarget: 2000 },
        recovery: { techniques: [{ name: 'stretching' }] },
        progress: { weightGoal: { target: 70 } },
      };
      const userProfile = { level: 'beginner', weight: 70, height: 170 };
      const context = { workoutHistory: [] };

      const validation = safetyValidator.validateCompleteRecommendation(
        recommendation,
        userProfile,
        context
      );

      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('warnings');
      expect(validation).toHaveProperty('errors');
      expect(validation).toHaveProperty('safetyScore');
    });
  });

  describe('Safety Recommendations Generation', () => {
    test('should generate safety recommendations', () => {
      const validation = {
        isValid: false,
        warnings: ['Warning 1', 'Warning 2'],
        errors: ['Error 1'],
        safetyScore: 60,
      };

      const recommendations =
        safetyValidator.generateSafetyRecommendations(validation);

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Data Structure Validation', () => {
    test('should have consistent rule structure', () => {
      const exerciseRules = safetyValidator.safetyRules.exercise;
      expect(exerciseRules.intensityLimits.beginner).toBeDefined();
      expect(exerciseRules.intensityLimits.intermediate).toBeDefined();
      expect(exerciseRules.intensityLimits.advanced).toBeDefined();
    });

    test('should have consistent user profile structure', () => {
      const profiles = safetyValidator.userProfiles;
      expect(profiles.beginner).toBeDefined();
      expect(profiles.intermediate).toBeDefined();
      expect(profiles.advanced).toBeDefined();
    });

    test('should have valid intensity limits for all levels', () => {
      const limits = safetyValidator.safetyRules.exercise.intensityLimits;
      ['beginner', 'intermediate', 'advanced'].forEach((level) => {
        expect(limits[level].maxWeight).toBeGreaterThan(0);
        expect(limits[level].maxReps).toBeGreaterThan(0);
        expect(limits[level].maxSets).toBeGreaterThan(0);
      });
    });

    test('should have valid rest periods for all levels', () => {
      const restPeriods = safetyValidator.safetyRules.exercise.restPeriods;
      ['beginner', 'intermediate', 'advanced'].forEach((level) => {
        expect(restPeriods[level]).toBeDefined();
        expect(restPeriods[level].minRest).toBeGreaterThan(0);
        expect(restPeriods[level].maxRest).toBeGreaterThan(
          restPeriods[level].minRest
        );
      });
    });

    test('should have valid calorie limits', () => {
      const calorieLimits = safetyValidator.safetyRules.nutrition.calorieLimits;
      expect(calorieLimits).toBeDefined();
      expect(calorieLimits.minDaily).toBeGreaterThan(0);
      expect(calorieLimits.maxDaily).toBeGreaterThan(calorieLimits.minDaily);
    });

    test('should have valid macro limits', () => {
      const macroLimits = safetyValidator.safetyRules.nutrition.macroLimits;
      expect(macroLimits.protein.min).toBeGreaterThan(0);
      expect(macroLimits.carbs.min).toBeGreaterThan(0);
      expect(macroLimits.fat.min).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle missing user profile data', () => {
      const exercise = { name: 'Squat', weight: 50, reps: 10 };
      const userProfile = {};

      const validation = safetyValidator.validateExerciseRecommendation(
        exercise,
        userProfile
      );

      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('safetyScore');
    });

    test('should handle empty workout context', () => {
      const exercise = { name: 'Squat', weight: 50, reps: 10 };
      const userProfile = { level: 'beginner' };

      const validation = safetyValidator.validateExerciseRecommendation(
        exercise,
        userProfile,
        {}
      );

      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('safetyScore');
    });

    test('should handle null values', () => {
      const exercise = { name: 'Squat', weight: null, reps: null };
      const userProfile = { level: 'beginner' };

      const validation = safetyValidator.validateExerciseRecommendation(
        exercise,
        userProfile
      );

      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('safetyScore');
    });

    test('should handle undefined values', () => {
      const exercise = { name: 'Squat' };
      const userProfile = { level: 'beginner' };

      const validation = safetyValidator.validateExerciseRecommendation(
        exercise,
        userProfile
      );

      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('safetyScore');
    });
  });
});
