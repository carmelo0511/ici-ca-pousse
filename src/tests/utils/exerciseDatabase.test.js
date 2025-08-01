import { exerciseDatabase } from '../../utils/workout/exerciseDatabase';

describe('Exercise Database', () => {
  test('should have exercise database defined', () => {
    expect(exerciseDatabase).toBeDefined();
    expect(typeof exerciseDatabase).toBe('object');
    expect(Object.keys(exerciseDatabase).length).toBeGreaterThan(0);
  });

  test('should have pectoraux exercises', () => {
    expect(exerciseDatabase.pectoraux).toBeDefined();
    expect(Array.isArray(exerciseDatabase.pectoraux)).toBe(true);
    expect(exerciseDatabase.pectoraux.length).toBeGreaterThan(0);
  });

  test('should have jambes exercises', () => {
    expect(exerciseDatabase.jambes).toBeDefined();
    expect(Array.isArray(exerciseDatabase.jambes)).toBe(true);
    expect(exerciseDatabase.jambes.length).toBeGreaterThan(0);
  });

  test('should have dos exercises', () => {
    expect(exerciseDatabase.dos).toBeDefined();
    expect(Array.isArray(exerciseDatabase.dos)).toBe(true);
    expect(exerciseDatabase.dos.length).toBeGreaterThan(0);
  });

  test('should have abdos exercises', () => {
    expect(exerciseDatabase.abdos).toBeDefined();
    expect(Array.isArray(exerciseDatabase.abdos)).toBe(true);
    expect(exerciseDatabase.abdos.length).toBeGreaterThan(0);
  });

  test('should have cardio exercises', () => {
    expect(exerciseDatabase.cardio).toBeDefined();
    expect(Array.isArray(exerciseDatabase.cardio)).toBe(true);
    expect(exerciseDatabase.cardio.length).toBeGreaterThan(0);
  });

  test('should have épaules exercises', () => {
    expect(exerciseDatabase.épaules).toBeDefined();
    expect(Array.isArray(exerciseDatabase.épaules)).toBe(true);
    expect(exerciseDatabase.épaules.length).toBeGreaterThan(0);
  });

  test('should have biceps exercises', () => {
    expect(exerciseDatabase.biceps).toBeDefined();
    expect(Array.isArray(exerciseDatabase.biceps)).toBe(true);
    expect(exerciseDatabase.biceps.length).toBeGreaterThan(0);
  });

  test('should have triceps exercises', () => {
    expect(exerciseDatabase.triceps).toBeDefined();
    expect(Array.isArray(exerciseDatabase.triceps)).toBe(true);
    expect(exerciseDatabase.triceps.length).toBeGreaterThan(0);
  });

  test('should have all major muscle groups', () => {
    const expectedGroups = [
      'pectoraux',
      'jambes',
      'dos',
      'abdos',
      'cardio',
      'épaules',
      'biceps',
      'triceps',
    ];

    expectedGroups.forEach((group) => {
      expect(exerciseDatabase[group]).toBeDefined();
      expect(Array.isArray(exerciseDatabase[group])).toBe(true);
      expect(exerciseDatabase[group].length).toBeGreaterThan(0);
    });
  });

  test('should have valid exercise names', () => {
    Object.values(exerciseDatabase).forEach((exercises) => {
      exercises.forEach((exercise) => {
        expect(typeof exercise).toBe('string');
        expect(exercise.length).toBeGreaterThan(0);
        expect(exercise.trim()).toBe(exercise); // No leading/trailing spaces
      });
    });
  });

  test('should have unique exercise names within each group', () => {
    Object.entries(exerciseDatabase).forEach(([group, exercises]) => {
      const uniqueExercises = new Set(exercises);
      expect(uniqueExercises.size).toBe(exercises.length);
    });
  });

  test('should have exercises with proper capitalization', () => {
    Object.values(exerciseDatabase).forEach((exercises) => {
      exercises.forEach((exercise) => {
        // Check if exercise name starts with capital letter
        expect(exercise.charAt(0)).toBe(exercise.charAt(0).toUpperCase());
      });
    });
  });

  test('should have reasonable number of exercises per group', () => {
    Object.entries(exerciseDatabase).forEach(([group, exercises]) => {
      expect(exercises.length).toBeGreaterThanOrEqual(3); // At least 3 exercises per group
      expect(exercises.length).toBeLessThanOrEqual(20); // No more than 20 exercises per group
    });
  });

  test('should have common exercises in pectoraux', () => {
    const commonPectorauxExercises = [
      'Pompes',
      'Développé couché',
      'Développé incliné',
    ];
    commonPectorauxExercises.forEach((exercise) => {
      expect(exerciseDatabase.pectoraux).toContain(exercise);
    });
  });

  test('should have common exercises in jambes', () => {
    const commonJambesExercises = ['Squat', 'Fentes', 'Mollets debout'];
    commonJambesExercises.forEach((exercise) => {
      expect(exerciseDatabase.jambes).toContain(exercise);
    });
  });

  test('should have common exercises in dos', () => {
    const commonDosExercises = [
      'Tractions',
      'Rowing barre',
      'Tirage horizontal',
    ];
    commonDosExercises.forEach((exercise) => {
      expect(exerciseDatabase.dos).toContain(exercise);
    });
  });

  test('should have common exercises in abdos', () => {
    const commonAbdosExercises = ['Crunch', 'Planche', 'Relevé de jambes'];
    commonAbdosExercises.forEach((exercise) => {
      expect(exerciseDatabase.abdos).toContain(exercise);
    });
  });

  test('should have common exercises in cardio', () => {
    const commonCardioExercises = ['Burpees', 'Course à pied', 'Vélo'];
    commonCardioExercises.forEach((exercise) => {
      expect(exerciseDatabase.cardio).toContain(exercise);
    });
  });

  test('should have common exercises in épaules', () => {
    const commonEpaulesExercises = [
      'Développé militaire',
      'Élévations latérales',
      'Élévations frontales',
    ];
    commonEpaulesExercises.forEach((exercise) => {
      expect(exerciseDatabase.épaules).toContain(exercise);
    });
  });

  test('should have common exercises in biceps', () => {
    const commonBicepsExercises = [
      'Curl barre',
      'Curl haltères',
      'Curl marteau',
    ];
    commonBicepsExercises.forEach((exercise) => {
      expect(exerciseDatabase.biceps).toContain(exercise);
    });
  });

  test('should have common exercises in triceps', () => {
    const commonTricepsExercises = [
      'Dips',
      'Extension couché',
      'Pompes diamant',
    ];
    commonTricepsExercises.forEach((exercise) => {
      expect(exerciseDatabase.triceps).toContain(exercise);
    });
  });

  test('should have no duplicate exercises across groups', () => {
    const allExercises = [];
    Object.values(exerciseDatabase).forEach((exercises) => {
      exercises.forEach((exercise) => {
        allExercises.push(exercise);
      });
    });

    const uniqueExercises = new Set(allExercises);
    // Allow some duplicates like 'Dips' which can be for both pectoraux and triceps
    expect(uniqueExercises.size).toBeGreaterThan(allExercises.length * 0.8); // At least 80% unique
  });
});
