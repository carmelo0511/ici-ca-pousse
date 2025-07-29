import { renderHook, act } from '@testing-library/react';
import useAppState from '../../hooks/useAppState';

// Mock the storage utilities
jest.mock('../../utils/storage', () => ({
  load: jest.fn(),
  save: jest.fn()
}));

describe('useAppState', () => {
  const mockLoad = require('../../utils/storage').load;
  const mockSave = require('../../utils/storage').save;

  beforeEach(() => {
    localStorage.clear();
    mockLoad.mockReturnValue({});
    mockSave.mockImplementation(() => {});
    jest.useFakeTimers();
    
    // Mock localStorage methods
    Object.defineProperty(window, 'localStorage', {
      value: {
        removeItem: jest.fn(),
        getItem: jest.fn(),
        setItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

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
      const now = new Date();
      const expectedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      expect(result.current.selectedDate).toBe(expectedDate);
    });

    it('should initialize with saved values from storage', () => {
      const savedData = {
        selectedDate: '2024-01-15',
        startTime: '10:00',
        endTime: '11:00',
        exercises: [{ name: 'Squat', sets: [] }]
      };
      mockLoad.mockReturnValue(savedData);

      const { result } = renderHook(() => useAppState());

      expect(result.current.selectedDate).toBe('2024-01-15');
      expect(result.current.startTime).toBe('10:00');
      expect(result.current.endTime).toBe('11:00');
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

    it('should update active tab multiple times', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setActiveTab('stats');
      });
      expect(result.current.activeTab).toBe('stats');

      act(() => {
        result.current.setActiveTab('profile');
      });
      expect(result.current.activeTab).toBe('profile');

      act(() => {
        result.current.setActiveTab('workout');
      });
      expect(result.current.activeTab).toBe('workout');
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
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.showToastMsg('Test message');
      });

      expect(result.current.toast.show).toBe(true);

      act(() => {
        jest.advanceTimersByTime(2500);
      });

      expect(result.current.toast.show).toBe(false);
    });

    it('should handle multiple toast messages', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.showToastMsg('First message', 'success');
      });

      expect(result.current.toast.message).toBe('First message');

      act(() => {
        result.current.showToastMsg('Second message', 'error');
      });

      expect(result.current.toast.message).toBe('Second message');
      expect(result.current.toast.type).toBe('error');
    });

    it('should reset toast state after auto-hide', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.showToastMsg('Test message', 'warning');
      });

      act(() => {
        jest.advanceTimersByTime(2500);
      });

      expect(result.current.toast).toEqual({
        show: false,
        message: '',
        type: 'success'
      });
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

    it('should update selected date', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setSelectedDate('2024-01-15');
      });

      expect(result.current.selectedDate).toBe('2024-01-15');
    });

    it('should update selected workout', () => {
      const { result } = renderHook(() => useAppState());
      const workout = { id: '1', name: 'Test Workout', exercises: [] };

      act(() => {
        result.current.setSelectedWorkout(workout);
      });

      expect(result.current.selectedWorkout).toEqual(workout);
    });

    it('should update show add exercise state', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setShowAddExercise(true);
      });

      expect(result.current.showAddExercise).toBe(true);

      act(() => {
        result.current.setShowAddExercise(false);
      });

      expect(result.current.showAddExercise).toBe(false);
    });

    it('should update show workout detail state', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setShowWorkoutDetail(true);
      });

      expect(result.current.showWorkoutDetail).toBe(true);

      act(() => {
        result.current.setShowWorkoutDetail(false);
      });

      expect(result.current.showWorkoutDetail).toBe(false);
    });

    it('should update selected muscle group', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setSelectedMuscleGroup('back');
      });

      expect(result.current.selectedMuscleGroup).toBe('back');

      act(() => {
        result.current.setSelectedMuscleGroup(null);
      });

      expect(result.current.selectedMuscleGroup).toBeNull();
    });

    it('should update migrate prompt state', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setShowMigratePrompt(true);
      });

      expect(result.current.showMigratePrompt).toBe(true);

      act(() => {
        result.current.setShowMigratePrompt(false);
      });

      expect(result.current.showMigratePrompt).toBe(false);
    });
  });

  describe('Storage Integration', () => {
    it('should save workout form data to storage', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setStartTime('10:00');
        result.current.setEndTime('11:00');
        result.current.setSelectedDate('2024-01-15');
      });

      expect(mockSave).toHaveBeenCalledWith(
        'currentWorkout',
        expect.objectContaining({
          startTime: '10:00',
          endTime: '11:00',
          selectedDate: '2024-01-15'
        })
      );
    });

    it('should clear storage when clearing workout form', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.clearWorkoutForm();
      });

      expect(localStorage.removeItem).toHaveBeenCalledWith('currentWorkout');
    });

    it('should handle storage cleanup for empty exercises', () => {
      const savedData = { exercises: [] };
      mockLoad.mockReturnValue(savedData);

      const { result } = renderHook(() => useAppState());

      // The useEffect should trigger and remove the storage item
      expect(localStorage.removeItem).toHaveBeenCalledWith('currentWorkout');
    });

    it('should not clear storage when exercises exist', () => {
      const savedData = { exercises: [{ name: 'Squat', sets: [] }] };
      mockLoad.mockReturnValue(savedData);

      const { result } = renderHook(() => useAppState());

      // Should not remove storage when exercises exist
      expect(localStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values in form fields', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setStartTime(null);
        result.current.setEndTime(null);
        result.current.setSelectedMuscleGroup(null);
      });

      expect(result.current.startTime).toBe(null);
      expect(result.current.endTime).toBe(null);
      expect(result.current.selectedMuscleGroup).toBeNull();
    });

    it('should handle empty string values', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setStartTime('');
        result.current.setEndTime('');
      });

      expect(result.current.startTime).toBe('');
      expect(result.current.endTime).toBe('');
    });

    it('should handle rapid state changes', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setActiveTab('stats');
        result.current.setActiveTab('profile');
        result.current.setActiveTab('workout');
      });

      expect(result.current.activeTab).toBe('workout');
    });

    it('should handle multiple toast messages in quick succession', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.showToastMsg('Message 1');
        result.current.showToastMsg('Message 2');
        result.current.showToastMsg('Message 3');
      });

      expect(result.current.toast.message).toBe('Message 3');
    });
  });
}); 