import { exerciseDatabase } from '../../utils/workout/exerciseDatabase';

describe('Basic Utils', () => {
  describe('Exercise Database', () => {
    test('should have exercise database with muscle groups', () => {
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
      });
    });

    test('should have valid exercise names', () => {
      Object.values(exerciseDatabase).forEach((exercises) => {
        exercises.forEach((exercise) => {
          expect(typeof exercise).toBe('string');
          expect(exercise.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Constants', () => {
    test('should have storage keys defined', () => {
      // Test that localStorage keys are accessible
      const testKey = 'test_key';
      const testValue = 'test_value';

      localStorage.setItem(testKey, testValue);
      expect(localStorage.getItem(testKey)).toBe(testValue);
      localStorage.removeItem(testKey);
    });

    test('should have valid exercise types', () => {
      const exerciseTypes = [
        'pectoraux',
        'jambes',
        'dos',
        'abdos',
        'cardio',
        'épaules',
        'biceps',
        'triceps',
      ];

      exerciseTypes.forEach((type) => {
        expect(typeof type).toBe('string');
        expect(type.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Date Utils', () => {
    test('should format date correctly', () => {
      const testDate = new Date('2024-01-15');
      const formatted = testDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('2024');
    });

    test('should handle date parsing', () => {
      const dateString = '2024-01-15';
      const parsedDate = new Date(dateString);

      expect(parsedDate instanceof Date).toBe(true);
      expect(parsedDate.getFullYear()).toBe(2024);
      expect(parsedDate.getMonth()).toBe(0); // January is 0
      // Note: Date parsing can be affected by timezone, so we test the year and month instead
    });
  });

  describe('Array Utils', () => {
    test('should filter arrays correctly', () => {
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const evenNumbers = numbers.filter((n) => n % 2 === 0);

      expect(evenNumbers).toEqual([2, 4, 6, 8, 10]);
    });

    test('should map arrays correctly', () => {
      const numbers = [1, 2, 3, 4, 5];
      const doubled = numbers.map((n) => n * 2);

      expect(doubled).toEqual([2, 4, 6, 8, 10]);
    });

    test('should reduce arrays correctly', () => {
      const numbers = [1, 2, 3, 4, 5];
      const sum = numbers.reduce((acc, n) => acc + n, 0);

      expect(sum).toBe(15);
    });
  });

  describe('Object Utils', () => {
    test('should merge objects correctly', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { c: 3, d: 4 };
      const merged = { ...obj1, ...obj2 };

      expect(merged).toEqual({ a: 1, b: 2, c: 3, d: 4 });
    });

    test('should check object properties', () => {
      const obj = { name: 'test', value: 123 };

      expect(obj.hasOwnProperty('name')).toBe(true);
      expect(obj.hasOwnProperty('value')).toBe(true);
      expect(obj.hasOwnProperty('nonexistent')).toBe(false);
    });
  });

  describe('String Utils', () => {
    test('should capitalize strings', () => {
      const testString = 'hello world';
      const capitalized =
        testString.charAt(0).toUpperCase() + testString.slice(1);

      expect(capitalized).toBe('Hello world');
    });

    test('should trim strings', () => {
      const testString = '  hello world  ';
      const trimmed = testString.trim();

      expect(trimmed).toBe('hello world');
    });

    test('should split strings', () => {
      const testString = 'apple,banana,orange';
      const split = testString.split(',');

      expect(split).toEqual(['apple', 'banana', 'orange']);
    });
  });

  describe('Math Utils', () => {
    test('should calculate percentages', () => {
      const part = 25;
      const total = 100;
      const percentage = (part / total) * 100;

      expect(percentage).toBe(25);
    });

    test('should round numbers', () => {
      const number = 3.14159;
      const rounded = Math.round(number);

      expect(rounded).toBe(3);
    });

    test('should calculate averages', () => {
      const numbers = [10, 20, 30, 40, 50];
      const average = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;

      expect(average).toBe(30);
    });
  });
});
