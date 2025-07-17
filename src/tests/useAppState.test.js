import { renderHook, act } from '@testing-library/react';
import useAppState from '../hooks/useAppState.js';

describe('useAppState', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAppState());

    expect(result.current.activeTab).toBe('workout');
    expect(result.current.toast).toEqual({ show: false, message: '', type: 'success' });
    expect(result.current.showAddExercise).toBe(false);
    expect(result.current.selectedWorkout).toBeNull();
  });

  it('should update active tab', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.setActiveTab('stats');
    });

    expect(result.current.activeTab).toBe('stats');
  });

  it('should show toast message', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.showToastMsg('Test message', 'error');
    });

    expect(result.current.toast).toEqual({
      show: true,
      message: 'Test message',
      type: 'error'
    });
  });

  it('should clear workout form', () => {
    const { result } = renderHook(() => useAppState());

    // Set some form values
    act(() => {
      result.current.setStartTime('10:00');
      result.current.setEndTime('11:00');
      result.current.setSelectedWorkout({ id: '1', name: 'Test' });
      result.current.setShowAddExercise(true);
      result.current.setSelectedMuscleGroup('chest');
    });

    // Clear the form
    act(() => {
      result.current.clearWorkoutForm();
    });

    expect(result.current.startTime).toBe('');
    expect(result.current.endTime).toBe('');
    expect(result.current.selectedWorkout).toBeNull();
    expect(result.current.showAddExercise).toBe(false);
    expect(result.current.selectedMuscleGroup).toBeNull();
  });

  it('should update selected date', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.setSelectedDate('2024-01-15');
    });

    expect(result.current.selectedDate).toBe('2024-01-15');
  });
}); 