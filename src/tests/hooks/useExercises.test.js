import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useExercises } from '../../hooks/useExercises';

// Mock the storage utilities
jest.mock('../../utils/storage', () => ({
  load: jest.fn(),
  save: jest.fn()
}));

jest.mock('../../utils/exerciseDatabase', () => ({
  exerciseDatabase: {
    chest: ['Pompes', 'Bench Press'],
    back: ['Pull-ups', 'Rows'],
    legs: ['Squats', 'Deadlifts']
  }
}));

describe('useExercises', () => {
  const mockLoad = require('../../utils/storage').load;
  const mockSave = require('../../utils/storage').save;

  beforeEach(() => {
    localStorage.clear();
    mockLoad.mockReturnValue({});
    mockSave.mockImplementation(() => {});
  });

  it('should add and remove an exercise', () => {
    const { result } = renderHook(() => useExercises());

    act(() => {
      result.current.addExercise('Pompes');
    });
    expect(result.current.exercises.length).toBe(1);

    const id = result.current.exercises[0].id;
    act(() => {
      result.current.removeExercise(id);
    });

    expect(result.current.exercises.length).toBe(0);
  });

  it('updates exercises and manages sets', () => {
    const { result } = renderHook(() => useExercises());

    act(() => {
      result.current.addExercise('Squat');
    });
    const id = result.current.exercises[0].id;

    act(() => {
      result.current.updateExercise(id, { id, name: 'Pull-up', sets: [] });
    });
    expect(result.current.exercises[0].name).toBe('Pull-up');

    act(() => {
      result.current.addSet(id);
    });
    expect(result.current.exercises[0].sets.length).toBe(1);

    act(() => {
      result.current.updateSet(id, 0, 'reps', 10);
    });
    expect(result.current.exercises[0].sets[0].reps).toBe(10);

    act(() => {
      result.current.removeSet(id, 0);
    });
    expect(result.current.exercises[0].sets.length).toBe(0);
  });

  it('clears and sets exercises from workout', () => {
    const { result } = renderHook(() => useExercises());

    act(() => {
      result.current.addExercise('Row');
    });
    expect(result.current.exercises.length).toBe(1);

    act(() => {
      result.current.setExercisesFromWorkout([
        { id: 1, name: 'Bench', sets: [] },
      ]);
    });
    expect(result.current.exercises[0].name).toBe('Bench');

    act(() => {
      result.current.clearExercises();
    });
    expect(result.current.exercises.length).toBe(0);
  });

  it('should not add exercise with empty name', () => {
    const { result } = renderHook(() => useExercises());

    act(() => {
      result.current.addExercise('');
    });
    expect(result.current.exercises.length).toBe(0);

    act(() => {
      result.current.addExercise('   ');
    });
    expect(result.current.exercises.length).toBe(0);

    act(() => {
      result.current.addExercise(null);
    });
    expect(result.current.exercises.length).toBe(0);
  });

  it('should auto-detect muscle group from exercise name', () => {
    const { result } = renderHook(() => useExercises());

    act(() => {
      result.current.addExercise('Pompes');
    });

    expect(result.current.exercises[0].type).toBe('chest');
  });

  it('should use provided muscle group when specified', () => {
    const { result } = renderHook(() => useExercises());

    act(() => {
      result.current.addExercise('Custom Exercise', 'back');
    });

    expect(result.current.exercises[0].type).toBe('back');
  });

  it('should use custom type when muscle group not found', () => {
    const { result } = renderHook(() => useExercises());

    act(() => {
      result.current.addExercise('Unknown Exercise');
    });

    expect(result.current.exercises[0].type).toBe('custom');
  });

  it('should handle weight parsing with comma', () => {
    const { result } = renderHook(() => useExercises());

    act(() => {
      result.current.addExercise('Squat');
    });
    const id = result.current.exercises[0].id;

    act(() => {
      result.current.updateSet(id, 0, 'weight', '100,5');
    });

    expect(result.current.exercises[0].sets[0].weight).toBe(100.5);
  });

  it('should handle invalid weight values', () => {
    const { result } = renderHook(() => useExercises());

    act(() => {
      result.current.addExercise('Squat');
    });
    const id = result.current.exercises[0].id;

    act(() => {
      result.current.updateSet(id, 0, 'weight', 'invalid');
    });

    expect(result.current.exercises[0].sets[0].weight).toBe(0);
  });

  it('should handle negative values by setting to 0', () => {
    const { result } = renderHook(() => useExercises());

    act(() => {
      result.current.addExercise('Squat');
    });
    const id = result.current.exercises[0].id;

    act(() => {
      result.current.updateSet(id, 0, 'reps', -5);
    });

    expect(result.current.exercises[0].sets[0].reps).toBe(0);
  });

  it('should handle invalid reps values', () => {
    const { result } = renderHook(() => useExercises());

    act(() => {
      result.current.addExercise('Squat');
    });
    const id = result.current.exercises[0].id;

    act(() => {
      result.current.updateSet(id, 0, 'reps', 'invalid');
    });

    expect(result.current.exercises[0].sets[0].reps).toBe(0);
  });

  it('should initialize with saved exercises from storage', () => {
    const savedExercises = [
      { id: 1, name: 'Saved Exercise', sets: [] }
    ];
    mockLoad.mockReturnValue({ exercises: savedExercises });

    const { result } = renderHook(() => useExercises());

    expect(result.current.exercises).toEqual(savedExercises);
  });

  it('should save exercises to storage when they change', () => {
    const { result } = renderHook(() => useExercises());

    act(() => {
      result.current.addExercise('Test Exercise');
    });

    expect(mockSave).toHaveBeenCalledWith(
      'currentWorkout',
      expect.objectContaining({
        exercises: expect.arrayContaining([
          expect.objectContaining({ name: 'Test Exercise' })
        ])
      })
    );
  });

  it('should clear selected muscle group after adding exercise', () => {
    const { result } = renderHook(() => useExercises());

    act(() => {
      result.current.setSelectedMuscleGroup('chest');
    });
    expect(result.current.selectedMuscleGroup).toBe('chest');

    act(() => {
      result.current.addExercise('Pompes');
    });
    expect(result.current.selectedMuscleGroup).toBeNull();
  });

  it('should handle multiple sets correctly', () => {
    const { result } = renderHook(() => useExercises());

    act(() => {
      result.current.addExercise('Squat');
    });
    const id = result.current.exercises[0].id;

    act(() => {
      result.current.addSet(id);
      result.current.addSet(id);
    });

    expect(result.current.exercises[0].sets.length).toBe(3); // Initial set + 2 added

    act(() => {
      result.current.updateSet(id, 0, 'reps', 10);
      result.current.updateSet(id, 1, 'reps', 8);
      result.current.updateSet(id, 2, 'reps', 6);
    });

    expect(result.current.exercises[0].sets[0].reps).toBe(10);
    expect(result.current.exercises[0].sets[1].reps).toBe(8);
    expect(result.current.exercises[0].sets[2].reps).toBe(6);
  });

  it('should remove specific set by index', () => {
    const { result } = renderHook(() => useExercises());

    act(() => {
      result.current.addExercise('Squat');
    });
    const id = result.current.exercises[0].id;

    act(() => {
      result.current.addSet(id);
      result.current.addSet(id);
    });

    expect(result.current.exercises[0].sets.length).toBe(3);

    act(() => {
      result.current.removeSet(id, 1);
    });

    expect(result.current.exercises[0].sets.length).toBe(2);
  });

  it('should handle exercise with no matching ID for update', () => {
    const { result } = renderHook(() => useExercises());

    act(() => {
      result.current.addExercise('Squat');
    });

    act(() => {
      result.current.updateExercise(999, { id: 999, name: 'Updated', sets: [] });
    });

    expect(result.current.exercises[0].name).toBe('Squat'); // Should remain unchanged
  });

  it('should handle set update with non-matching exercise ID', () => {
    const { result } = renderHook(() => useExercises());

    act(() => {
      result.current.addExercise('Squat');
    });

    act(() => {
      result.current.updateSet(999, 0, 'reps', 10);
    });

    expect(result.current.exercises[0].sets[0].reps).toBe(0); // Should remain unchanged
  });
});
