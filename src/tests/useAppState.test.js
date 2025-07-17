import { renderHook, act } from '@testing-library/react';
import useAppState from '../hooks/useAppState';

// Mock des dépendances
jest.mock('../utils/firebase', () => ({
  saveUserBadges: jest.fn(),
  saveUserExperience: jest.fn(),
  saveUserStreak: jest.fn()
}));

describe('useAppState', () => {
  const mockUser = {
    uid: 'test-user-id',
    displayName: 'Test User',
    email: 'test@example.com',
    badges: [],
    experience: 0,
    level: 1,
    streak: 0
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAppState(mockUser));

    expect(result.current.user).toBe(mockUser);
    expect(result.current.workouts).toEqual([]);
    expect(result.current.challenges).toEqual([]);
    expect(result.current.friends).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it('should update user profile', () => {
    const { result } = renderHook(() => useAppState(mockUser));

    act(() => {
      result.current.updateUserProfile({
        ...mockUser,
        displayName: 'Updated Name',
        badges: ['first_workout']
      });
    });

    expect(result.current.user.displayName).toBe('Updated Name');
    expect(result.current.user.badges).toEqual(['first_workout']);
  });

  it('should add workout', () => {
    const { result } = renderHook(() => useAppState(mockUser));
    const newWorkout = {
      id: 'workout-1',
      date: new Date().toISOString(),
      exercises: []
    };

    act(() => {
      result.current.addWorkout(newWorkout);
    });

    expect(result.current.workouts).toHaveLength(1);
    expect(result.current.workouts[0]).toEqual(newWorkout);
  });

  it('should update workout', () => {
    const { result } = renderHook(() => useAppState(mockUser));
    const workout = {
      id: 'workout-1',
      date: new Date().toISOString(),
      exercises: []
    };

    act(() => {
      result.current.addWorkout(workout);
    });

    const updatedWorkout = {
      ...workout,
      exercises: [{ name: 'Squat', sets: [] }]
    };

    act(() => {
      result.current.updateWorkout('workout-1', updatedWorkout);
    });

    expect(result.current.workouts[0].exercises).toHaveLength(1);
    expect(result.current.workouts[0].exercises[0].name).toBe('Squat');
  });

  it('should delete workout', () => {
    const { result } = renderHook(() => useAppState(mockUser));
    const workout = {
      id: 'workout-1',
      date: new Date().toISOString(),
      exercises: []
    };

    act(() => {
      result.current.addWorkout(workout);
    });

    expect(result.current.workouts).toHaveLength(1);

    act(() => {
      result.current.deleteWorkout('workout-1');
    });

    expect(result.current.workouts).toHaveLength(0);
  });

  it('should add friend', () => {
    const { result } = renderHook(() => useAppState(mockUser));
    const newFriend = {
      uid: 'friend-1',
      displayName: 'Friend User',
      email: 'friend@example.com'
    };

    act(() => {
      result.current.addFriend(newFriend);
    });

    expect(result.current.friends).toHaveLength(1);
    expect(result.current.friends[0]).toEqual(newFriend);
  });

  it('should remove friend', () => {
    const { result } = renderHook(() => useAppState(mockUser));
    const friend = {
      uid: 'friend-1',
      displayName: 'Friend User',
      email: 'friend@example.com'
    };

    act(() => {
      result.current.addFriend(friend);
    });

    expect(result.current.friends).toHaveLength(1);

    act(() => {
      result.current.removeFriend('friend-1');
    });

    expect(result.current.friends).toHaveLength(0);
  });

  it('should add challenge', () => {
    const { result } = renderHook(() => useAppState(mockUser));
    const newChallenge = {
      id: 'challenge-1',
      title: 'Test Challenge',
      description: 'Test Description',
      participants: [mockUser.uid]
    };

    act(() => {
      result.current.addChallenge(newChallenge);
    });

    expect(result.current.challenges).toHaveLength(1);
    expect(result.current.challenges[0]).toEqual(newChallenge);
  });

  it('should update loading state', () => {
    const { result } = renderHook(() => useAppState(mockUser));

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });
}); 