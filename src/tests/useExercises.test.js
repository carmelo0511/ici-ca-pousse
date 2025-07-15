import { renderHook, act } from '@testing-library/react';
import { useExercises } from '../hooks/useExercises';

// Mock exerciseDatabase
jest.mock('../utils/exerciseDatabase', () => ({
  exerciseDatabase: {
    legs: ['Squats', 'Lunges'],
    chest: ['Push-ups', 'Bench Press']
  }
}));

describe('useExercises', () => {
  it('should initialize with empty exercises', () => {
    const { result } = renderHook(() => useExercises());
    
    expect(result.current.exercises).toEqual([]);
    expect(result.current.selectedMuscleGroup).toBeNull();
  });

  it('should add an exercise', () => {
    const { result } = renderHook(() => useExercises());
    
    act(() => {
      result.current.addExercise('Squats');
    });
    
    expect(result.current.exercises).toHaveLength(1);
    expect(result.current.exercises[0].name).toBe('Squats');
    expect(result.current.exercises[0].sets).toHaveLength(1);
    expect(result.current.selectedMuscleGroup).toBeNull();
  });

  it('should add a set to an exercise', () => {
    const { result } = renderHook(() => useExercises());
    
    act(() => {
      result.current.addExercise('Squats');
    });
    
    expect(result.current.exercises).toHaveLength(1);
    const exerciseId = result.current.exercises[0].id;
    
    act(() => {
      result.current.addSet(exerciseId);
    });
    
    expect(result.current.exercises[0].sets).toHaveLength(2);
  });

  it('should update a set', () => {
    const { result } = renderHook(() => useExercises());
    
    act(() => {
      result.current.addExercise('Squats');
    });
    
    const exerciseId = result.current.exercises[0].id;
    
    act(() => {
      result.current.updateSet(exerciseId, 0, 'reps', 12);
    });
    
    expect(result.current.exercises[0].sets[0].reps).toBe(12);
  });

  it('should remove a set', () => {
    const { result } = renderHook(() => useExercises());
    
    act(() => {
      result.current.addExercise('Squats');
    });
    
    const exerciseId = result.current.exercises[0].id;
    expect(result.current.exercises[0].sets).toHaveLength(1);
    
    act(() => {
      result.current.addSet(exerciseId);
    });
    
    expect(result.current.exercises[0].sets).toHaveLength(2);
    
    act(() => {
      result.current.removeSet(exerciseId, 0);
    });
    
    expect(result.current.exercises[0].sets).toHaveLength(1);
  });

  it('should remove an exercise', () => {
    const { result } = renderHook(() => useExercises());
    
    act(() => {
      result.current.addExercise('Squats');
    });
    
    expect(result.current.exercises).toHaveLength(1);
    
    const exerciseId = result.current.exercises[0].id;
    
    act(() => {
      result.current.removeExercise(exerciseId);
    });
    
    expect(result.current.exercises).toHaveLength(0);
  });

  it('should clear all exercises', () => {
    const { result } = renderHook(() => useExercises());
    
    act(() => {
      result.current.addExercise('Squats');
    });
    
    expect(result.current.exercises).toHaveLength(1);
    
    act(() => {
      result.current.clearExercises();
    });
    
    expect(result.current.exercises).toHaveLength(0);
  });

  it('should set selected muscle group', () => {
    const { result } = renderHook(() => useExercises());
    
    act(() => {
      result.current.setSelectedMuscleGroup('legs');
    });
    
    expect(result.current.selectedMuscleGroup).toBe('legs');
  });

  it('should set exercises from workout', () => {
    const { result } = renderHook(() => useExercises());
    const workoutExercises = [
      { id: 1, name: 'Squats', sets: [{ reps: 10, weight: 50 }] }
    ];
    
    act(() => {
      result.current.setExercisesFromWorkout(workoutExercises);
    });
    
    expect(result.current.exercises).toEqual(workoutExercises);
  });
}); 