import { renderHook } from '@testing-library/react';
import { useBadges, calculateUserBadges } from '../hooks/useBadges';
import { BADGE_TYPES } from '../constants/badges';

jest.mock('../utils/firebase', () => ({
  saveUserBadges: jest.fn()
}));

describe('useBadges', () => {
  const mockUser = { uid: 'user-1', badges: [] };

  it('should unlock FIRST_WORKOUT badge for first workout', () => {
    const workouts = [{ id: 'w1', date: new Date().toISOString(), exercises: [] }];
    const badges = calculateUserBadges(workouts, [], mockUser);
    expect(badges).toContain(BADGE_TYPES.FIRST_WORKOUT);
  });

  it('should unlock STREAK_5 badge for 5 consecutive days', () => {
    const today = new Date();
    const workouts = Array.from({ length: 5 }, (_, i) => ({
      id: `w${i+1}`,
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - i).toISOString(),
      exercises: []
    })).reverse();
    const badges = calculateUserBadges(workouts, [], mockUser);
    expect(badges).toContain(BADGE_TYPES.STREAK_5);
  });

  it('should unlock WEIGHT_100 badge for 100kg lift', () => {
    const workouts = [{
      id: 'w1',
      date: new Date().toISOString(),
      exercises: [{ name: 'Développé couché', sets: [{ weight: 100 }] }]
    }];
    const badges = calculateUserBadges(workouts, [], mockUser);
    expect(badges).toContain(BADGE_TYPES.WEIGHT_100);
  });

  it('should unlock CHALLENGE_WINNER badge for winning a challenge', () => {
    const challenges = [{ winnerId: mockUser.uid, status: 'completed' }];
    const badges = calculateUserBadges([], challenges, mockUser);
    expect(badges).toContain(BADGE_TYPES.CHALLENGE_WINNER);
  });

  it('should return empty array if no workouts or challenges', () => {
    const badges = calculateUserBadges([], [], mockUser);
    expect(badges).toEqual([]);
  });
}); 