import { renderHook, act } from '@testing-library/react';
import { useWorkouts } from '../hooks/useWorkouts';
import { load, save } from '../utils/storage';

// Mock storage utils
jest.mock('../utils/storage');

describe('useWorkouts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    load.mockReturnValue([]);
  });

  it('should initialize with empty workouts', () => {
    const { result } = renderHook(() => useWorkouts());
    
    expect(result.current.workouts).toEqual([]);
    expect(load).toHaveBeenCalledWith('iciCaPousse_workouts', []);
  });

  it('should load saved workouts on initialization', () => {
    const savedWorkouts = [
      { id: 1, date: '2024-01-01', exercises: [], duration: 30 }
    ];
    load.mockReturnValue(savedWorkouts);
    
    const { result } = renderHook(() => useWorkouts());
    
    expect(result.current.workouts).toEqual(savedWorkouts);
  });

  it('should add a new workout', () => {
    const { result } = renderHook(() => useWorkouts());
    const newWorkout = { id: 1, date: '2024-01-01', exercises: [], duration: 30 };
    
    act(() => {
      result.current.addWorkout(newWorkout);
    });
    
    expect(result.current.workouts).toHaveLength(1);
    expect(result.current.workouts[0]).toEqual(newWorkout);
  });

  it('should update an existing workout', () => {
    const initialWorkouts = [{ id: 1, date: '2024-01-01', exercises: [], duration: 30 }];
    load.mockReturnValue(initialWorkouts);
    
    const { result } = renderHook(() => useWorkouts());
    const updatedWorkout = { id: 1, date: '2024-01-01', exercises: [], duration: 45 };
    
    act(() => {
      result.current.updateWorkout(1, updatedWorkout);
    });
    
    expect(result.current.workouts[0].duration).toBe(45);
  });

  it('should delete a workout', () => {
    const initialWorkouts = [{ id: 1, date: '2024-01-01', exercises: [], duration: 30 }];
    load.mockReturnValue(initialWorkouts);
    
    const { result } = renderHook(() => useWorkouts());
    
    act(() => {
      result.current.deleteWorkout(1);
    });
    
    expect(result.current.workouts).toHaveLength(0);
  });

  it('should find workout by date', () => {
    const workouts = [
      { id: 1, date: '2024-01-01', exercises: [], duration: 30 },
      { id: 2, date: '2024-01-02', exercises: [], duration: 45 }
    ];
    load.mockReturnValue(workouts);
    
    const { result } = renderHook(() => useWorkouts());
    
    const foundWorkout = result.current.getWorkoutForDate('2024-01-01');
    expect(foundWorkout).toEqual(workouts[0]);
  });

  it('should calculate stats correctly', () => {
    const workouts = [
      { id: 1, date: '2024-01-01', exercises: [], duration: 30, totalSets: 5, totalReps: 50, totalWeight: 100 },
      { id: 2, date: '2024-01-02', exercises: [], duration: 45, totalSets: 3, totalReps: 30, totalWeight: 80 }
    ];
    load.mockReturnValue(workouts);
    
    const { result } = renderHook(() => useWorkouts());
    
    const stats = result.current.getStats();
    expect(stats.totalWorkouts).toBe(2);
    expect(stats.totalSets).toBe(8);
    expect(stats.totalReps).toBe(80);
    expect(stats.totalWeight).toBe(180);
    expect(stats.avgDuration).toBe(38);
  });

  it('should save workouts when they change', () => {
    const { result } = renderHook(() => useWorkouts());
    const newWorkout = { id: 1, date: '2024-01-01', exercises: [], duration: 30 };
    
    act(() => {
      result.current.addWorkout(newWorkout);
    });
    
    expect(save).toHaveBeenCalledWith('iciCaPousse_workouts', [newWorkout]);
  });
}); 