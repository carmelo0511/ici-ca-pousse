import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useExercises } from '../../hooks/useExercises';

describe('useExercises', () => {
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
});
