import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useExercises } from '../../hooks/useExercises';

describe('useExercises', () => {
  beforeEach(() => {
    localStorage.clear();
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
});
