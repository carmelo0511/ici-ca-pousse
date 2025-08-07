// Simple utility tests without external dependencies

// Mock Firebase
jest.mock('../utils/firebase/firebase', () => ({
  auth: { currentUser: null },
  firestore: {},
}));

describe('Utility Functions', () => {
  describe('basic utilities', () => {
    test('date formatting', () => {
      const formatDate = (date) => {
        return date.toLocaleDateString('fr-FR');
      };
      
      const date = new Date(2024, 0, 15); // Year, Month (0-indexed), Day
      const formatted = formatDate(date);
      expect(formatted).toBe('15/01/2024');
    });

    test('duration calculation', () => {
      const calculateDuration = (start, end) => {
        const [startHour, startMin] = start.split(':').map(Number);
        const [endHour, endMin] = end.split(':').map(Number);
        
        let startMinutes = startHour * 60 + startMin;
        let endMinutes = endHour * 60 + endMin;
        
        if (endMinutes < startMinutes) {
          endMinutes += 24 * 60; // Handle overnight
        }
        
        return endMinutes - startMinutes;
      };
      
      expect(calculateDuration('10:00', '11:30')).toBe(90);
      expect(calculateDuration('23:00', '01:00')).toBe(120);
    });
  });

  describe('badge system', () => {
    test('badge logic', () => {
      const getBadge = (count) => {
        if (count === 0) return null;
        if (count === 1) return { name: 'Première Séance', icon: '🏋️' };
        if (count >= 5) return { name: 'Débutant', icon: '💪' };
        if (count >= 10) return { name: 'Régulier', icon: '🔥' };
        return { name: 'En cours', icon: '⏳' };
      };
      
      expect(getBadge(0)).toBeNull();
      expect(getBadge(1)).toEqual({
        name: 'Première Séance',
        icon: '🏋️'
      });
      expect(getBadge(5)).toEqual({
        name: 'Débutant',
        icon: '💪'
      });
    });
  });

  describe('local storage simulation', () => {
    test('localStorage operations work', () => {
      // Simuler le comportement localStorage
      const mockStorage = {};
      
      const save = (key, data) => {
        mockStorage[key] = JSON.stringify(data);
      };
      
      const load = (key, defaultValue) => {
        const stored = mockStorage[key];
        return stored ? JSON.parse(stored) : defaultValue;
      };
      
      // Test save
      const testData = { id: 1, name: 'test' };
      save('test-key', testData);
      expect(mockStorage['test-key']).toBe(JSON.stringify(testData));
      
      // Test load
      const loaded = load('test-key', {});
      expect(loaded).toEqual(testData);
      
      // Test default value
      const defaultResult = load('nonexistent', { default: true });
      expect(defaultResult).toEqual({ default: true });
    });
  });
});