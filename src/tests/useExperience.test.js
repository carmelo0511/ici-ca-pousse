import { renderHook, act } from '@testing-library/react';
import { useExperience } from '../hooks/useExperience.js';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  getFirestore: jest.fn()
}));

describe('useExperience', () => {
  const mockUser = {
    uid: 'test-user-id',
    experience: { xp: 0, level: 1, progress: 0, levelName: 'Débutant', totalWorkouts: 0, streak: 0 }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        experience: { xp: 0, level: 1, progress: 0, levelName: 'Débutant', totalWorkouts: 0, streak: 0 }
      })
    });
    mockUpdateDoc.mockResolvedValue(undefined);
    mockDoc.mockReturnValue('mock-doc-ref');
  });

  it('should initialize with user experience', () => {
    const { result } = renderHook(() => useExperience(mockUser));
    expect(result.current.experience.xp).toBe(0);
    expect(result.current.experience.level).toBe(1);
    expect(result.current.experience.progress).toBe(0);
    expect(result.current.experience.levelName).toBe('Débutant');
  });

  it('should add workout XP and update level', async () => {
    const { result } = renderHook(() => useExperience(mockUser));
    const workout = { 
      date: new Date().toISOString(), 
      exercises: [{ name: 'Squat', sets: [{ reps: 10, weight: 50 }] }],
      duration: 45
    };
    
    await act(async () => {
      const result = await result.current.addWorkoutXP(workout, []);
      expect(result.xpGained).toBeGreaterThan(0);
    });
  });

  it('should update streak', async () => {
    const { result } = renderHook(() => useExperience(mockUser));
    
    await act(async () => {
      await result.current.updateStreak(5);
    });
    
    expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc-ref', {
      'experience.streak': 5
    });
  });

  it('should add XP for badge unlock', async () => {
    const { result } = renderHook(() => useExperience(mockUser));
    
    await act(async () => {
      const result = await result.current.addBadgeUnlockXP('Test Badge');
      expect(result.xpGained).toBe(25);
      expect(result.reason).toBe('Badge débloqué: Test Badge');
    });
  });

  it('should add XP for friend addition', async () => {
    const { result } = renderHook(() => useExperience(mockUser));
    
    await act(async () => {
      const result = await result.current.addFriendXP('John Doe');
      expect(result.xpGained).toBe(15);
      expect(result.reason).toBe('Nouvel ami: John Doe');
    });
  });

  it('should calculate workout XP correctly', () => {
    const { result } = renderHook(() => useExperience(mockUser));
    const workout = {
      exercises: [
        { name: 'Squat', sets: [{ reps: 10, weight: 50 }] },
        { name: 'Push-up', sets: [{ reps: 15 }] }
      ],
      duration: 60
    };
    
    const xp = result.current.calculateWorkoutXP(workout);
    expect(xp).toBeGreaterThan(0);
  });
}); 