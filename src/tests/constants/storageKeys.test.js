import { STORAGE_KEYS } from '../../constants/storageKeys';

describe('Storage Keys', () => {
  test('should have storage keys defined', () => {
    expect(STORAGE_KEYS).toBeDefined();
    expect(typeof STORAGE_KEYS).toBe('object');
  });

  test('should have workouts storage key', () => {
    expect(STORAGE_KEYS.WORKOUTS).toBeDefined();
    expect(typeof STORAGE_KEYS.WORKOUTS).toBe('string');
    expect(STORAGE_KEYS.WORKOUTS.length).toBeGreaterThan(0);
  });



  test('should have theme storage key', () => {
    expect(STORAGE_KEYS.THEME).toBeDefined();
    expect(typeof STORAGE_KEYS.THEME).toBe('string');
    expect(STORAGE_KEYS.THEME.length).toBeGreaterThan(0);
  });

  test('should have current workout storage key', () => {
    expect(STORAGE_KEYS.CURRENT_WORKOUT).toBeDefined();
    expect(typeof STORAGE_KEYS.CURRENT_WORKOUT).toBe('string');
    expect(STORAGE_KEYS.CURRENT_WORKOUT.length).toBeGreaterThan(0);
  });

  test('should have workout templates storage key', () => {
    expect(STORAGE_KEYS.WORKOUT_TEMPLATES).toBeDefined();
    expect(typeof STORAGE_KEYS.WORKOUT_TEMPLATES).toBe('string');
    expect(STORAGE_KEYS.WORKOUT_TEMPLATES.length).toBeGreaterThan(0);
  });

  test('should have chatbot memory storage key', () => {
    expect(STORAGE_KEYS.CHATBOT_MEMORY).toBeDefined();
    expect(typeof STORAGE_KEYS.CHATBOT_MEMORY).toBe('string');
    expect(STORAGE_KEYS.CHATBOT_MEMORY.length).toBeGreaterThan(0);
  });

  test('should have chatbot cache storage key', () => {
    expect(STORAGE_KEYS.CHATBOT_CACHE).toBeDefined();
    expect(typeof STORAGE_KEYS.CHATBOT_CACHE).toBe('string');
    expect(STORAGE_KEYS.CHATBOT_CACHE.length).toBeGreaterThan(0);
  });

  test('should have all required storage keys', () => {
    const requiredKeys = [
      'WORKOUTS',
      'THEME',
      'CURRENT_WORKOUT',
      'WORKOUT_TEMPLATES',
      'CHATBOT_MEMORY',
      'CHATBOT_CACHE',
    ];

    requiredKeys.forEach((key) => {
      expect(STORAGE_KEYS[key]).toBeDefined();
      expect(typeof STORAGE_KEYS[key]).toBe('string');
      expect(STORAGE_KEYS[key].length).toBeGreaterThan(0);
    });
  });

  test('should have unique storage key values', () => {
    const keyValues = Object.values(STORAGE_KEYS);
    const uniqueValues = new Set(keyValues);

    expect(uniqueValues.size).toBe(keyValues.length);
  });

  test('should have descriptive storage key names', () => {
    Object.entries(STORAGE_KEYS).forEach(([key, value]) => {
      expect(key).toMatch(/^[A-Z_]+$/); // Uppercase with underscores
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    });
  });

  test('should be able to use storage keys with localStorage', () => {
    const testKey = STORAGE_KEYS.WORKOUTS;
    const testValue = 'test_workout_data';

    // Test that we can set and get values using the storage keys
    localStorage.setItem(testKey, testValue);
    expect(localStorage.getItem(testKey)).toBe(testValue);
    localStorage.removeItem(testKey);
  });

  test('should have consistent naming convention', () => {
    Object.keys(STORAGE_KEYS).forEach((key) => {
      // All keys should be in UPPER_SNAKE_CASE
      expect(key).toMatch(/^[A-Z][A-Z0-9_]*$/);
    });
  });

  test('should have meaningful key names', () => {
    expect(STORAGE_KEYS.WORKOUTS).toContain('workouts');
    expect(STORAGE_KEYS.THEME).toContain('theme');
    expect(STORAGE_KEYS.CURRENT_WORKOUT).toContain('Workout');
    expect(STORAGE_KEYS.WORKOUT_TEMPLATES).toContain('workoutTemplates');
    expect(STORAGE_KEYS.CHATBOT_MEMORY).toContain('memory');
    expect(STORAGE_KEYS.CHATBOT_CACHE).toContain('cache');
  });
});
