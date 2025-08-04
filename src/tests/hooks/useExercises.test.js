import { renderHook, act } from '@testing-library/react';
import { useExercises } from '../../hooks/useExercises';
// import { exerciseDatabase } from '../../utils/workout/exerciseDatabase';
import { load, save } from '../../utils/firebase/storage';
import { STORAGE_KEYS } from '../../constants';

jest.mock('../../utils/workout/exerciseDatabase', () => ({
  exerciseDatabase: {
    chest: ['Push-ups', 'Bench Press'],
    legs: ['Squats', 'Lunges'],
    back: ['Pull-ups', 'Rows'],
  },
}));

jest.mock('../../utils/firebase/storage', () => ({
  load: jest.fn(),
  save: jest.fn(),
}));

jest.mock('../../constants', () => ({
  STORAGE_KEYS: {
    CURRENT_WORKOUT: 'currentWorkout',
  },
}));

describe('useExercises', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
    load.mockReturnValue({});
    localStorage.getItem.mockReturnValue(null);
  });

  test('should initialize with empty exercises array', () => {
    const { result } = renderHook(() => useExercises());

    expect(result.current.exercises).toEqual([]);
    expect(result.current.selectedMuscleGroup).toBe(null);
  });

  test('should initialize with saved exercises from storage', () => {
    const savedExercises = [
      { id: 1, name: 'Push-ups', sets: [{ reps: 10, weight: 0, duration: 0 }] }
    ];
    load.mockReturnValue({ exercises: savedExercises });

    const { result } = renderHook(() => useExercises());

    expect(result.current.exercises).toEqual(savedExercises);
  });

  test('should initialize with copied workout data', () => {
    const copiedExercises = [
      { id: 1, name: 'Squats', sets: [{ reps: 15, weight: 50, duration: 0 }] }
    ];
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'load_copied_workout') return 'true';
      if (key === 'copied_workout_data') return JSON.stringify(copiedExercises);
      return null;
    });

    const { result } = renderHook(() => useExercises());

    expect(result.current.exercises).toEqual(copiedExercises);
    expect(localStorage.removeItem).toHaveBeenCalledWith('load_copied_workout');
    expect(localStorage.removeItem).toHaveBeenCalledWith('copied_workout_data');
  });

  test('should handle error when parsing copied workout data', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'load_copied_workout') return 'true';
      if (key === 'copied_workout_data') return 'invalid-json';
      return null;
    });
    load.mockReturnValue({ exercises: [] });

    const { result } = renderHook(() => useExercises());

    expect(result.current.exercises).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  test('should add exercise with auto-detected muscle group', () => {
    jest.spyOn(Date, 'now').mockReturnValue(123456);
    const { result } = renderHook(() => useExercises());

    act(() => {
      result.current.addExercise('Push-ups');
    });

    expect(result.current.exercises).toHaveLength(1);
    expect(result.current.exercises[0]).toEqual({
      id: 123456,
      name: 'Push-ups',
      sets: [{ reps: 0, weight: 0, duration: 0 }],
      type: 'chest',
    });

    Date.now.mockRestore();
  });

  test('should add exercise with specified muscle group', () => {
    jest.spyOn(Date, 'now').mockReturnValue(123456);
    const { result } = renderHook(() => useExercises());

    act(() => {
      result.current.addExercise('Custom Exercise', 'back');
    });

    expect(result.current.exercises[0].type).toBe('back');

    Date.now.mockRestore();
  });

  test('should add exercise with custom type for unknown exercise', () => {
    jest.spyOn(Date, 'now').mockReturnValue(123456);
    const { result } = renderHook(() => useExercises());

    act(() => {
      result.current.addExercise('Unknown Exercise');
    });

    expect(result.current.exercises[0].type).toBe('custom');

    Date.now.mockRestore();
  });

  test('should not add exercise with empty name', () => {
    const { result } = renderHook(() => useExercises());

    act(() => {
      result.current.addExercise('');
    });

    expect(result.current.exercises).toHaveLength(0);

    act(() => {
      result.current.addExercise('   ');
    });

    expect(result.current.exercises).toHaveLength(0);
  });

  test('should update exercise', () => {
    const { result } = renderHook(() => useExercises());
    const initialExercise = {
      id: 1,
      name: 'Push-ups',
      sets: [{ reps: 10, weight: 0, duration: 0 }],
      type: 'chest'
    };

    act(() => {
      result.current.setExercisesFromWorkout([initialExercise]);
    });

    const updatedExercise = { ...initialExercise, name: 'Modified Push-ups' };

    act(() => {
      result.current.updateExercise(1, updatedExercise);
    });

    expect(result.current.exercises[0].name).toBe('Modified Push-ups');
  });

  test('should remove exercise', () => {
    const { result } = renderHook(() => useExercises());
    const exercises = [
      { id: 1, name: 'Push-ups' },
      { id: 2, name: 'Squats' }
    ];

    act(() => {
      result.current.setExercisesFromWorkout(exercises);
    });

    act(() => {
      result.current.removeExercise(1);
    });

    expect(result.current.exercises).toHaveLength(1);
    expect(result.current.exercises[0].id).toBe(2);
  });

  test('should add set to exercise', () => {
    const { result } = renderHook(() => useExercises());
    const exercise = {
      id: 1,
      name: 'Push-ups',
      sets: [{ reps: 10, weight: 0, duration: 0 }]
    };

    act(() => {
      result.current.setExercisesFromWorkout([exercise]);
    });

    act(() => {
      result.current.addSet(1);
    });

    expect(result.current.exercises[0].sets).toHaveLength(2);
    expect(result.current.exercises[0].sets[1]).toEqual({
      reps: 0,
      weight: 0,
      duration: 0
    });
  });

  test('should update set with integer values', () => {
    const { result } = renderHook(() => useExercises());
    const exercise = {
      id: 1,
      name: 'Push-ups',
      sets: [{ reps: 10, weight: 0, duration: 0 }]
    };

    act(() => {
      result.current.setExercisesFromWorkout([exercise]);
    });

    act(() => {
      result.current.updateSet(1, 0, 'reps', '15');
    });

    expect(result.current.exercises[0].sets[0].reps).toBe(15);
  });

  test('should update set with float weight values', () => {
    const { result } = renderHook(() => useExercises());
    const exercise = {
      id: 1,
      name: 'Bench Press',
      sets: [{ reps: 10, weight: 50, duration: 0 }]
    };

    act(() => {
      result.current.setExercisesFromWorkout([exercise]);
    });

    act(() => {
      result.current.updateSet(1, 0, 'weight', '52.5');
    });

    expect(result.current.exercises[0].sets[0].weight).toBe(52.5);

    // Test comma as decimal separator
    act(() => {
      result.current.updateSet(1, 0, 'weight', '55,5');
    });

    expect(result.current.exercises[0].sets[0].weight).toBe(55.5);
  });

  test('should handle invalid values with minimum 0', () => {
    const { result } = renderHook(() => useExercises());
    const exercise = {
      id: 1,
      name: 'Push-ups',
      sets: [{ reps: 10, weight: 0, duration: 0 }]
    };

    act(() => {
      result.current.setExercisesFromWorkout([exercise]);
    });

    act(() => {
      result.current.updateSet(1, 0, 'reps', '-5');
    });

    expect(result.current.exercises[0].sets[0].reps).toBe(0);

    act(() => {
      result.current.updateSet(1, 0, 'reps', 'invalid');
    });

    expect(result.current.exercises[0].sets[0].reps).toBe(0);
  });

  test('should remove set from exercise', () => {
    const { result } = renderHook(() => useExercises());
    const exercise = {
      id: 1,
      name: 'Push-ups',
      sets: [
        { reps: 10, weight: 0, duration: 0 },
        { reps: 15, weight: 0, duration: 0 }
      ]
    };

    act(() => {
      result.current.setExercisesFromWorkout([exercise]);
    });

    act(() => {
      result.current.removeSet(1, 0);
    });

    expect(result.current.exercises[0].sets).toHaveLength(1);
    expect(result.current.exercises[0].sets[0].reps).toBe(15);
  });

  test('should clear all exercises', () => {
    const { result } = renderHook(() => useExercises());
    const exercises = [
      { id: 1, name: 'Push-ups' },
      { id: 2, name: 'Squats' }
    ];

    act(() => {
      result.current.setExercisesFromWorkout(exercises);
    });

    act(() => {
      result.current.clearExercises();
    });

    expect(result.current.exercises).toEqual([]);
    expect(save).toHaveBeenCalledWith(STORAGE_KEYS.CURRENT_WORKOUT, expect.objectContaining({
      exercises: []
    }));
  });

  test('should set exercises from workout', () => {
    const { result } = renderHook(() => useExercises());
    const newExercises = [
      { id: 1, name: 'Push-ups' },
      { id: 2, name: 'Squats' }
    ];

    act(() => {
      result.current.setExercisesFromWorkout(newExercises);
    });

    expect(result.current.exercises).toEqual(newExercises);
    expect(save).toHaveBeenCalledWith(STORAGE_KEYS.CURRENT_WORKOUT, expect.objectContaining({
      exercises: newExercises
    }));
  });

  test('should update selectedMuscleGroup', () => {
    const { result } = renderHook(() => useExercises());

    act(() => {
      result.current.setSelectedMuscleGroup('chest');
    });

    expect(result.current.selectedMuscleGroup).toBe('chest');
  });

  test('should save exercises to storage on change', () => {
    const { result } = renderHook(() => useExercises());

    act(() => {
      result.current.addExercise('Push-ups');
    });

    expect(save).toHaveBeenCalledWith(STORAGE_KEYS.CURRENT_WORKOUT, expect.objectContaining({
      exercises: expect.arrayContaining([
        expect.objectContaining({ name: 'Push-ups' })
      ])
    }));
  });
});