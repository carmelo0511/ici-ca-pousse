import { renderHook, act } from '@testing-library/react';
import { useWorkouts } from '../../hooks/useWorkouts';

// Mock Firebase
jest.mock('../../utils/firebase', () => ({
  db: {}
}));

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  onSnapshot: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn()
}));

// Mock storage utilities
jest.mock('../../utils/storage', () => ({
  load: jest.fn(),
  save: jest.fn()
}));

// Mock workout utils
jest.mock('../../utils/workoutUtils', () => ({
  cleanWorkoutForFirestore: jest.fn(workout => workout)
}));

describe('useWorkouts', () => {
  const mockLoad = require('../../utils/storage').load;
  const mockSave = require('../../utils/storage').save;
  const mockAddDoc = require('firebase/firestore').addDoc;
  const mockSetDoc = require('firebase/firestore').setDoc;
  const mockDeleteDoc = require('firebase/firestore').deleteDoc;
  const mockOnSnapshot = require('firebase/firestore').onSnapshot;
  const mockCollection = require('firebase/firestore').collection;
  const mockQuery = require('firebase/firestore').query;
  const mockWhere = require('firebase/firestore').where;
  const mockDoc = require('firebase/firestore').doc;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLoad.mockReturnValue([]);
    mockSave.mockImplementation(() => {});
    mockAddDoc.mockResolvedValue({ id: 'new-workout-id' });
    mockSetDoc.mockResolvedValue();
    mockDeleteDoc.mockResolvedValue();
    
    // Mock Firestore functions
    mockCollection.mockReturnValue('workouts-collection');
    mockQuery.mockReturnValue('workouts-query');
    mockWhere.mockReturnValue('workouts-where');
    mockDoc.mockReturnValue('workout-doc');
  });

  describe('Initialization', () => {
    it('should initialize with empty workouts when no user', () => {
      const { result } = renderHook(() => useWorkouts(null));

      expect(result.current.workouts).toEqual([]);
    });

    it('should load workouts from localStorage when no user', () => {
      const savedWorkouts = [
        { id: 1, date: '2024-01-01', exercises: [] },
        { id: 2, date: '2024-01-02', exercises: [] }
      ];
      mockLoad.mockReturnValue(savedWorkouts);

      const { result } = renderHook(() => useWorkouts(null));

      expect(result.current.workouts).toEqual(savedWorkouts);
      expect(mockLoad).toHaveBeenCalledWith('iciCaPousse_workouts', []);
    });

    it('should set up Firestore listener when user is connected', () => {
      const mockUnsubscribe = jest.fn();
      const mockQuerySnapshot = {
        docs: [
          { id: '1', data: () => ({ date: '2024-01-01', exercises: [] }) },
          { id: '2', data: () => ({ date: '2024-01-02', exercises: [] }) }
        ]
      };

      mockCollection.mockReturnValue('workouts-collection');
      mockQuery.mockReturnValue('workouts-query');
      mockWhere.mockReturnValue('workouts-where');
      mockOnSnapshot.mockImplementation((query, callback) => {
        callback(mockQuerySnapshot);
        return mockUnsubscribe;
      });

      const user = { uid: 'user123' };
      const { result } = renderHook(() => useWorkouts(user));

      expect(mockCollection).toHaveBeenCalledWith({}, 'workouts');
      expect(mockQuery).toHaveBeenCalledWith('workouts-collection', 'workouts-where');
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'user123');
      expect(mockOnSnapshot).toHaveBeenCalledWith('workouts-query', expect.any(Function));
    });
  });

  describe('addWorkout', () => {
    it('should add workout to Firestore when user is connected', async () => {
      const user = { uid: 'user123' };
      const { result } = renderHook(() => useWorkouts(user));

      const workout = {
        date: '2024-01-01',
        exercises: [{ name: 'Squat', sets: [{ reps: 5, weight: 100 }] }],
        duration: 45
      };

      await act(async () => {
        await result.current.addWorkout(workout);
      });

      expect(mockAddDoc).toHaveBeenCalledWith('workouts-collection', {
        userId: 'user123'
      });
    });

    it('should add workout locally when no user', async () => {
      const { result } = renderHook(() => useWorkouts(null));

      const workout = {
        date: '2024-01-01',
        exercises: [{ name: 'Squat', sets: [] }],
        duration: 45
      };

      await act(async () => {
        await result.current.addWorkout(workout);
      });

      expect(result.current.workouts).toHaveLength(1);
      expect(result.current.workouts[0]).toMatchObject(workout);
      expect(result.current.workouts[0].id).toBeDefined();
    });

    it('should use provided workout ID when no user', async () => {
      const { result } = renderHook(() => useWorkouts(null));

      const workout = {
        id: 'custom-id',
        date: '2024-01-01',
        exercises: [{ name: 'Squat', sets: [] }],
        duration: 45
      };

      await act(async () => {
        await result.current.addWorkout(workout);
      });

      expect(result.current.workouts[0].id).toBe('custom-id');
    });
  });

  describe('updateWorkout', () => {
    it('should update workout in Firestore when user is connected', async () => {
      const user = { uid: 'user123' };
      const { result } = renderHook(() => useWorkouts(user));

      const workoutId = 'workout123';
      const updatedWorkout = {
        date: '2024-01-01',
        exercises: [{ name: 'Bench', sets: [{ reps: 5, weight: 80 }] }],
        duration: 60
      };

      await act(async () => {
        await result.current.updateWorkout(workoutId, updatedWorkout);
      });

      expect(mockSetDoc).toHaveBeenCalledWith(
        'workout-doc',
        { userId: 'user123' },
        { merge: true }
      );
    });

    it('should update workout locally when no user', async () => {
      const { result } = renderHook(() => useWorkouts(null));

      // Add initial workout
      const initialWorkout = {
        id: 'workout123',
        date: '2024-01-01',
        exercises: [{ name: 'Squat', sets: [] }],
        duration: 45
      };

      await act(async () => {
        await result.current.addWorkout(initialWorkout);
      });

      // Update workout
      const updatedWorkout = {
        ...initialWorkout,
        exercises: [{ name: 'Bench', sets: [] }],
        duration: 60
      };

      await act(async () => {
        await result.current.updateWorkout('workout123', updatedWorkout);
      });

      expect(result.current.workouts).toHaveLength(1);
      expect(result.current.workouts[0].exercises[0].name).toBe('Bench');
      expect(result.current.workouts[0].duration).toBe(60);
    });

    it('should handle Firestore update errors', async () => {
      const user = { uid: 'user123' };
      const { result } = renderHook(() => useWorkouts(user));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSetDoc.mockRejectedValue(new Error('Firestore error'));

      const workoutId = 'workout123';
      const updatedWorkout = { date: '2024-01-01', exercises: [] };

      await expect(
        result.current.updateWorkout(workoutId, updatedWorkout)
      ).rejects.toThrow('Firestore error');

      expect(consoleSpy).toHaveBeenCalledWith('Erreur update Firestore:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('deleteWorkout', () => {
    it('should delete workout from Firestore when user is connected', async () => {
      const user = { uid: 'user123' };
      const { result } = renderHook(() => useWorkouts(user));

      const workoutId = 'workout123';

      await act(async () => {
        await result.current.deleteWorkout(workoutId);
      });

      expect(mockDeleteDoc).toHaveBeenCalledWith('workout-doc');
    });

    it('should delete workout locally when no user', async () => {
      const { result } = renderHook(() => useWorkouts(null));

      // Add initial workouts
      const workout1 = { id: 'workout1', date: '2024-01-01', exercises: [] };
      const workout2 = { id: 'workout2', date: '2024-01-02', exercises: [] };

      await act(async () => {
        await result.current.addWorkout(workout1);
        await result.current.addWorkout(workout2);
      });

      expect(result.current.workouts).toHaveLength(2);

      // Delete one workout
      await act(async () => {
        await result.current.deleteWorkout('workout1');
      });

      expect(result.current.workouts).toHaveLength(1);
      expect(result.current.workouts[0].id).toBe('workout2');
    });

    it('should handle Firestore delete errors', async () => {
      const user = { uid: 'user123' };
      const { result } = renderHook(() => useWorkouts(user));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockDeleteDoc.mockRejectedValue(new Error('Firestore error'));

      const workoutId = 'workout123';

      await expect(
        result.current.deleteWorkout(workoutId)
      ).rejects.toThrow('Firestore error');

      expect(consoleSpy).toHaveBeenCalledWith('Erreur suppression Firestore:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('getWorkoutForDate', () => {
    it('should return workout for specific date', () => {
      const { result } = renderHook(() => useWorkouts(null));

      // Add workouts
      act(() => {
        result.current.addWorkout({ id: '1', date: '2024-01-01', exercises: [] });
        result.current.addWorkout({ id: '2', date: '2024-01-02', exercises: [] });
      });

      const workout = result.current.getWorkoutForDate('2024-01-01');
      expect(workout).toEqual({ id: '1', date: '2024-01-01', exercises: [] });
    });

    it('should return undefined if no workout for date', () => {
      const { result } = renderHook(() => useWorkouts(null));

      act(() => {
        result.current.addWorkout({ id: '1', date: '2024-01-01', exercises: [] });
      });

      const workout = result.current.getWorkoutForDate('2024-01-02');
      expect(workout).toBeUndefined();
    });
  });

  describe('getStats', () => {
    it('should calculate stats correctly', () => {
      const { result } = renderHook(() => useWorkouts(null));

      act(() => {
        result.current.addWorkout({
          id: '1',
          date: '2024-01-01',
          exercises: [],
          totalSets: 3,
          totalReps: 30,
          totalWeight: 300,
          duration: 45
        });
        result.current.addWorkout({
          id: '2',
          date: '2024-01-02',
          exercises: [],
          totalSets: 2,
          totalReps: 20,
          totalWeight: 200,
          duration: 30
        });
      });

      const stats = result.current.getStats();
      expect(stats).toEqual({
        totalWorkouts: 2,
        totalSets: 5,
        totalReps: 50,
        totalWeight: 500,
        avgDuration: 38
      });
    });

    it('should handle workouts with missing properties', () => {
      const { result } = renderHook(() => useWorkouts(null));

      act(() => {
        result.current.addWorkout({
          id: '1',
          date: '2024-01-01',
          exercises: []
          // Missing totalSets, totalReps, totalWeight, duration
        });
      });

      const stats = result.current.getStats();
      expect(stats).toEqual({
        totalWorkouts: 1,
        totalSets: 0,
        totalReps: 0,
        totalWeight: 0,
        avgDuration: 0
      });
    });

    it('should return zero stats for empty workouts', () => {
      const { result } = renderHook(() => useWorkouts(null));

      const stats = result.current.getStats();
      expect(stats).toEqual({
        totalWorkouts: 0,
        totalSets: 0,
        totalReps: 0,
        totalWeight: 0,
        avgDuration: 0
      });
    });
  });

  describe('Storage Integration', () => {
    it('should save workouts to localStorage when no user', () => {
      const { result } = renderHook(() => useWorkouts(null));

      act(() => {
        result.current.addWorkout({ id: '1', date: '2024-01-01', exercises: [] });
      });

      expect(mockSave).toHaveBeenCalledWith('iciCaPousse_workouts', result.current.workouts);
    });

    it('should not save to localStorage when user is connected', () => {
      const user = { uid: 'user123' };
      const { result } = renderHook(() => useWorkouts(user));

      // Mock Firestore setup
      mockCollection.mockReturnValue('workouts-collection');
      mockQuery.mockReturnValue('workouts-query');
      mockWhere.mockReturnValue('workouts-where');
      mockOnSnapshot.mockReturnValue(jest.fn());

      expect(mockSave).not.toHaveBeenCalled();
    });
  });
}); 