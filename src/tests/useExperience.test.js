import { renderHook, act } from '@testing-library/react';
import { useExperience } from '../hooks/useExperience';

jest.mock('../utils/firebase', () => ({
  saveUserExperience: jest.fn()
}));

describe('useExperience', () => {
  const mockUser = {
    uid: 'test-user-id',
    experience: { xp: 0, level: 1, progress: 0, levelName: 'Débutant', totalWorkouts: 0, streak: 0 }
  };

  it('should initialize with user experience', () => {
    const { result } = renderHook(() => useExperience(mockUser));
    expect(result.current.experience.xp).toBe(0);
    expect(result.current.experience.level).toBe(1);
    expect(result.current.experience.progress).toBe(0);
    expect(result.current.experience.levelName).toBe('Débutant');
  });

  it('should add workout XP and update level', async () => {
    const { result } = renderHook(() => useExperience(mockUser));
    const workout = { date: new Date().toISOString(), exercises: [{ name: 'Squat' }] };
    await act(async () => {
      await result.current.addWorkoutXP(workout, []);
    });
    expect(result.current.experience.xp).toBeGreaterThan(0);
    expect(result.current.experience.level).toBeGreaterThanOrEqual(1);
  });

  it('should update streak', async () => {
    const { result } = renderHook(() => useExperience(mockUser));
    await act(async () => {
      await result.current.updateStreak(5);
    });
    expect(result.current.experience.streak).toBe(5);
  });
}); 