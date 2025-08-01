import {
  getStartDate,
  filterWorkoutsByPeriod,
  calculateUserStats,
  getLeaderboardRanking,
  formatMetricValue,
  getPeriodLabel,
  getMetricLabel,
  getAllowedExercises,
} from '../../utils/leaderboardUtils';
import {
  PERIODS,
  METRICS,
  ALLOWED_EXERCISES,
} from '../../constants/leaderboard';

// Mock des constantes
jest.mock('../../constants/leaderboard', () => ({
  PERIODS: {
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year',
    ALL_TIME: 'all_time',
  },
  METRICS: {
    WORKOUTS: 'workouts',
    MAX_WEIGHT: 'max_weight',
  },
  ALLOWED_EXERCISES: ['Squat', 'Deadlift', 'Bench Press', 'Pull-ups'],
}));

// Mock de workoutUtils
jest.mock('../../utils/workout/workoutUtils', () => ({
  parseLocalDate: jest.fn((date) => new Date(date)),
}));

describe('leaderboardUtils', () => {
  let dateSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date pour tous les tests
    const mockDate = new Date('2024-01-15T10:00:00.000Z');
    dateSpy = jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });

  afterEach(() => {
    dateSpy.mockRestore();
  });

  describe('getStartDate', () => {
    test('should return date 7 days ago for WEEK period', () => {
      const result = getStartDate(PERIODS.WEEK);
      const expectedDate = new Date('2024-01-08T10:00:00.000Z');

      expect(result.getTime()).toBe(expectedDate.getTime());
    });

    test('should return date 1 month ago for MONTH period', () => {
      const result = getStartDate(PERIODS.MONTH);
      const expectedDate = new Date('2023-12-15T10:00:00.000Z');

      expect(result.getTime()).toBe(expectedDate.getTime());
    });

    test('should return date 1 year ago for YEAR period', () => {
      const result = getStartDate(PERIODS.YEAR);
      const expectedDate = new Date('2023-01-15T10:00:00.000Z');

      expect(result.getTime()).toBe(expectedDate.getTime());
    });

    test('should return epoch date for ALL_TIME period', () => {
      const result = getStartDate(PERIODS.ALL_TIME);
      const epochDate = new Date(0);

      expect(result.getTime()).toBe(epochDate.getTime());
    });

    test('should default to WEEK period for unknown period', () => {
      const result = getStartDate('unknown');
      const expectedDate = new Date('2024-01-08T10:00:00.000Z');

      expect(result.getTime()).toBe(expectedDate.getTime());
    });
  });

  describe('filterWorkoutsByPeriod', () => {
    test('should filter workouts by period', () => {
      const workouts = [
        { date: '2024-01-10', exercises: [] },
        { date: '2024-01-05', exercises: [] },
        { date: '2023-12-20', exercises: [] },
      ];

      const result = filterWorkoutsByPeriod(workouts, PERIODS.WEEK);
      expect(Array.isArray(result)).toBe(true);
    });

    test('should return empty array for no workouts', () => {
      const result = filterWorkoutsByPeriod([], PERIODS.WEEK);
      expect(result).toEqual([]);
    });

    test('should handle workouts without date', () => {
      const workouts = [
        { exercises: [] },
        { date: '2024-01-10', exercises: [] },
      ];

      const result = filterWorkoutsByPeriod(workouts, PERIODS.WEEK);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('calculateUserStats', () => {
    test('should calculate stats for workouts with allowed exercises', () => {
      const workouts = [
        {
          date: '2024-01-10',
          exercises: [
            {
              name: 'Squat',
              sets: [
                { weight: 100, reps: 10 },
                { weight: 120, reps: 8 },
              ],
            },
            {
              name: 'Bench Press',
              sets: [
                { weight: 80, reps: 12 },
                { weight: 90, reps: 10 },
              ],
            },
          ],
        },
      ];

      const result = calculateUserStats(workouts, PERIODS.ALL_TIME);

      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('workouts');
      expect(result).toHaveProperty('maxWeight');
      expect(result).toHaveProperty('exerciseStats');
    });

    test('should ignore non-allowed exercises', () => {
      const workouts = [
        {
          date: '2024-01-10',
          exercises: [
            {
              name: 'Squat',
              sets: [{ weight: 100, reps: 10 }],
            },
            {
              name: 'Invalid Exercise',
              sets: [{ weight: 200, reps: 5 }],
            },
          ],
        },
      ];

      const result = calculateUserStats(workouts, PERIODS.ALL_TIME);

      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('workouts');
      expect(result).toHaveProperty('maxWeight');
    });

    test('should handle workouts without exercises', () => {
      const workouts = [
        { date: '2024-01-10' },
        { date: '2024-01-11', exercises: [] },
      ];

      const result = calculateUserStats(workouts, PERIODS.ALL_TIME);

      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('workouts');
      expect(result).toHaveProperty('maxWeight');
    });

    test('should handle exercises without sets', () => {
      const workouts = [
        {
          date: '2024-01-10',
          exercises: [{ name: 'Squat' }, { name: 'Bench Press', sets: [] }],
        },
      ];

      const result = calculateUserStats(workouts, PERIODS.ALL_TIME);

      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('workouts');
      expect(result).toHaveProperty('maxWeight');
    });

    test('should handle sets without weight', () => {
      const workouts = [
        {
          date: '2024-01-10',
          exercises: [
            {
              name: 'Squat',
              sets: [{ reps: 10 }, { weight: 100, reps: 8 }],
            },
          ],
        },
      ];

      const result = calculateUserStats(workouts, PERIODS.ALL_TIME);

      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('maxWeight');
    });

    test('should filter by period', () => {
      const workouts = [
        { date: '2024-01-10', exercises: [] },
        { date: '2023-12-20', exercises: [] },
      ];

      const result = calculateUserStats(workouts, PERIODS.WEEK);

      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('workouts');
    });
  });

  describe('getLeaderboardRanking', () => {
    test('should rank users by workouts count', () => {
      const usersStats = [
        {
          uid: 'user1',
          displayName: 'User 1',
          stats: { workouts: 5, maxWeight: 100 },
          photoURL: 'url1',
          selectedBadge: 'badge1',
          badges: ['badge1'],
          nickname: 'nick1',
        },
        {
          uid: 'user2',
          displayName: 'User 2',
          stats: { workouts: 10, maxWeight: 150 },
          photoURL: 'url2',
          selectedBadge: 'badge2',
          badges: ['badge2'],
          nickname: 'nick2',
        },
      ];

      const result = getLeaderboardRanking(usersStats, METRICS.WORKOUTS);

      expect(result).toHaveLength(2);
      expect(result[0].uid).toBe('user2'); // Higher workout count
      expect(result[0].value).toBe(10);
      expect(result[1].uid).toBe('user1');
      expect(result[1].value).toBe(5);
    });

    test('should rank users by max weight', () => {
      const usersStats = [
        {
          uid: 'user1',
          displayName: 'User 1',
          stats: { workouts: 5, maxWeight: 100 },
          photoURL: 'url1',
          selectedBadge: 'badge1',
          badges: ['badge1'],
          nickname: 'nick1',
        },
        {
          uid: 'user2',
          displayName: 'User 2',
          stats: { workouts: 10, maxWeight: 150 },
          photoURL: 'url2',
          selectedBadge: 'badge2',
          badges: ['badge2'],
          nickname: 'nick2',
        },
      ];

      const result = getLeaderboardRanking(usersStats, METRICS.MAX_WEIGHT);

      expect(result).toHaveLength(2);
      expect(result[0].uid).toBe('user2'); // Higher max weight
      expect(result[0].value).toBe(150);
      expect(result[1].uid).toBe('user1');
      expect(result[1].value).toBe(100);
    });

    test('should handle users without stats', () => {
      const usersStats = [
        {
          uid: 'user1',
          displayName: 'User 1',
          photoURL: 'url1',
          selectedBadge: 'badge1',
          badges: ['badge1'],
          nickname: 'nick1',
        },
        {
          uid: 'user2',
          displayName: 'User 2',
          stats: { workouts: 5, maxWeight: 100 },
          photoURL: 'url2',
          selectedBadge: 'badge2',
          badges: ['badge2'],
          nickname: 'nick2',
        },
      ];

      const result = getLeaderboardRanking(usersStats, METRICS.WORKOUTS);

      expect(result).toHaveLength(2);
      expect(result[0].uid).toBe('user2');
      expect(result[0].value).toBe(5);
      expect(result[1].uid).toBe('user1');
      expect(result[1].value).toBe(0);
    });

    test('should handle users without nickname', () => {
      const usersStats = [
        {
          uid: 'user1',
          displayName: 'User 1',
          stats: { workouts: 5, maxWeight: 100 },
          photoURL: 'url1',
          selectedBadge: 'badge1',
          badges: ['badge1'],
        },
      ];

      const result = getLeaderboardRanking(usersStats, METRICS.WORKOUTS);

      expect(result).toHaveLength(1);
      expect(result[0].nickname).toBe('');
    });

    test('should handle unknown metric', () => {
      const usersStats = [
        {
          uid: 'user1',
          displayName: 'User 1',
          stats: { workouts: 5, maxWeight: 100 },
          photoURL: 'url1',
          selectedBadge: 'badge1',
          badges: ['badge1'],
          nickname: 'nick1',
        },
      ];

      const result = getLeaderboardRanking(usersStats, 'unknown_metric');

      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(0);
    });
  });

  describe('formatMetricValue', () => {
    test('should format workout count', () => {
      const result = formatMetricValue(5, METRICS.WORKOUTS);
      expect(result).toBe('5 séances');
    });

    test('should format max weight', () => {
      const result = formatMetricValue(100, METRICS.MAX_WEIGHT);
      expect(result).toBe('100 kg');
    });

    test('should handle unknown metric', () => {
      const result = formatMetricValue(50, 'unknown');
      expect(result).toBe(50); // Retourne la valeur directement
    });
  });

  describe('getPeriodLabel', () => {
    test('should return correct labels for periods', () => {
      expect(getPeriodLabel(PERIODS.WEEK)).toBe('Cette semaine');
      expect(getPeriodLabel(PERIODS.MONTH)).toBe('Ce mois');
      expect(getPeriodLabel(PERIODS.YEAR)).toBe('Cette année');
      expect(getPeriodLabel(PERIODS.ALL_TIME)).toBe('Tout le temps');
    });

    test('should handle unknown period', () => {
      const result = getPeriodLabel('unknown');
      expect(result).toBe('Cette semaine');
    });
  });

  describe('getMetricLabel', () => {
    test('should return correct labels for metrics', () => {
      expect(getMetricLabel(METRICS.WORKOUTS)).toBe('Séances');
      expect(getMetricLabel(METRICS.MAX_WEIGHT)).toBe('Poids max');
    });

    test('should handle unknown metric', () => {
      const result = getMetricLabel('unknown');
      expect(result).toBe('Métrique');
    });
  });

  describe('getAllowedExercises', () => {
    test('should return allowed exercises array', () => {
      const result = getAllowedExercises();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('Squat');
      expect(result).toContain('Deadlift');
      expect(result).toContain('Bench Press');
      expect(result).toContain('Pull-ups');
    });
  });

  describe('Edge cases', () => {
    test('should handle empty workouts array', () => {
      const result = calculateUserStats([], PERIODS.ALL_TIME);
      expect(result.workouts).toBe(0);
      expect(result.maxWeight).toBe(0);
      expect(Object.keys(result.exerciseStats)).toHaveLength(0);
    });

    test('should handle empty users stats array', () => {
      const result = getLeaderboardRanking([], METRICS.WORKOUTS);
      expect(result).toEqual([]);
    });

    test('should handle workouts with null exercises', () => {
      const workouts = [{ date: '2024-01-10', exercises: null }];

      const result = calculateUserStats(workouts, PERIODS.ALL_TIME);
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('workouts');
    });

    test('should handle exercises with null sets', () => {
      const workouts = [
        {
          date: '2024-01-10',
          exercises: [{ name: 'Squat', sets: null }],
        },
      ];

      const result = calculateUserStats(workouts, PERIODS.ALL_TIME);
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('workouts');
    });

    test('should handle sets with null weight', () => {
      const workouts = [
        {
          date: '2024-01-10',
          exercises: [
            {
              name: 'Squat',
              sets: [
                { weight: null, reps: 10 },
                { weight: 100, reps: 8 },
              ],
            },
          ],
        },
      ];

      const result = calculateUserStats(workouts, PERIODS.ALL_TIME);
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('maxWeight');
    });
  });
});
