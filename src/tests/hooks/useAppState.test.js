import { renderHook } from '@testing-library/react';
import { act } from 'react';
import useAppState from '../../hooks/useAppState';

describe('useAppState', () => {
  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useAppState());

      expect(result.current.activeTab).toBe('workout');
      expect(result.current.toast).toEqual({
        show: false,
        message: '',
        type: 'success'
      });
      expect(result.current.showAddExercise).toBe(false);
      expect(result.current.selectedWorkout).toBeNull();
      expect(result.current.startTime).toBe('');
      expect(result.current.endTime).toBe('');
      expect(result.current.selectedMuscleGroup).toBeNull();
      expect(result.current.selectedDate).toBe(new Date().toISOString().split('T')[0]);
    });
  });

  describe('Tab Management', () => {
    it('should update active tab', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setActiveTab('stats');
      });

      expect(result.current.activeTab).toBe('stats');
    });
  });

  describe('Toast Management', () => {
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

    it('should use success as default toast type', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.showToastMsg('Test message');
      });

      expect(result.current.toast.type).toBe('success');
    });

    it('should auto-hide toast after timeout', () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.showToastMsg('Test message');
      });

      expect(result.current.toast.show).toBe(true);

      act(() => {
        jest.advanceTimersByTime(2500);
      });

      expect(result.current.toast.show).toBe(false);
      jest.useRealTimers();
    });
  });

  describe('Workout Form Management', () => {
    it('should update workout form fields', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setStartTime('10:00');
        result.current.setEndTime('11:00');
        result.current.setSelectedMuscleGroup('chest');
      });

      expect(result.current.startTime).toBe('10:00');
      expect(result.current.endTime).toBe('11:00');
      expect(result.current.selectedMuscleGroup).toBe('chest');
    });

    it('should clear workout form completely', () => {
      const { result } = renderHook(() => useAppState());

      // Set form values
      act(() => {
        result.current.setStartTime('10:00');
        result.current.setEndTime('11:00');
        result.current.setSelectedWorkout({ id: '1', name: 'Test Workout' });
        result.current.setShowAddExercise(true);
        result.current.setSelectedMuscleGroup('chest');
      });

      // Clear form
      act(() => {
        result.current.clearWorkoutForm();
      });

      expect(result.current.startTime).toBe('');
      expect(result.current.endTime).toBe('');
      expect(result.current.selectedWorkout).toBeNull();
      expect(result.current.showAddExercise).toBe(false);
      expect(result.current.selectedMuscleGroup).toBeNull();
    });

    it('should toggle add exercise modal', () => {
      const { result } = renderHook(() => useAppState());

      expect(result.current.showAddExercise).toBe(false);

      act(() => {
        result.current.setShowAddExercise(true);
      });

      expect(result.current.showAddExercise).toBe(true);

      act(() => {
        result.current.setShowAddExercise(false);
      });

      expect(result.current.showAddExercise).toBe(false);
    });
  });

  describe('Date Management', () => {
    it('should update selected date', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setSelectedDate('2024-01-15');
      });

      expect(result.current.selectedDate).toBe('2024-01-15');
    });
  });

  describe('Workout Selection', () => {
    it('should set selected workout', () => {
      const { result } = renderHook(() => useAppState());
      const mockWorkout = { id: '1', name: 'Push-ups', muscleGroup: 'chest' };

      act(() => {
        result.current.setSelectedWorkout(mockWorkout);
      });

      expect(result.current.selectedWorkout).toEqual(mockWorkout);
    });

    it('should clear selected workout', () => {
      const { result } = renderHook(() => useAppState());
      const mockWorkout = { id: '1', name: 'Push-ups' };

      act(() => {
        result.current.setSelectedWorkout(mockWorkout);
      });

      expect(result.current.selectedWorkout).toEqual(mockWorkout);

      act(() => {
        result.current.setSelectedWorkout(null);
      });

      expect(result.current.selectedWorkout).toBeNull();
    });
  });

  describe('Additional State Management', () => {
    it('should manage workout detail modal state', () => {
      const { result } = renderHook(() => useAppState());

      expect(result.current.showWorkoutDetail).toBe(false);

      act(() => {
        result.current.setShowWorkoutDetail(true);
      });

      expect(result.current.showWorkoutDetail).toBe(true);
    });

    it('should manage migration prompt state', () => {
      const { result } = renderHook(() => useAppState());

      expect(result.current.showMigratePrompt).toBe(false);

      act(() => {
        result.current.setShowMigratePrompt(true);
      });

      expect(result.current.showMigratePrompt).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string values', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setStartTime('');
        result.current.setEndTime('');
        result.current.setSelectedMuscleGroup('');
      });

      expect(result.current.startTime).toBe('');
      expect(result.current.endTime).toBe('');
      expect(result.current.selectedMuscleGroup).toBe('');
    });

    it('should handle null values', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setSelectedWorkout(null);
        result.current.setSelectedMuscleGroup(null);
      });

      expect(result.current.selectedWorkout).toBeNull();
      expect(result.current.selectedMuscleGroup).toBeNull();
    });
  });
}); 