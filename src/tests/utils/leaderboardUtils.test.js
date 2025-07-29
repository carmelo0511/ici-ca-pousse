import {
  getStartDate,
  filterWorkoutsByPeriod,
  calculateUserStats,
  getLeaderboardRanking,
  formatMetricValue,
  getPeriodLabel,
  getMetricLabel,
  getAllowedExercises
} from '../../utils/leaderboardUtils';
import { PERIODS, METRICS, ALLOWED_EXERCISES } from '../../constants/leaderboard';

describe('leaderboardUtils', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-08T12:00:00Z'));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('computes start dates correctly', () => {
    expect(getStartDate(PERIODS.WEEK)).toEqual(new Date('2024-01-01T12:00:00.000Z'));
    expect(getStartDate(PERIODS.MONTH)).toEqual(new Date('2023-12-08T12:00:00.000Z'));
    expect(getStartDate(PERIODS.YEAR)).toEqual(new Date('2023-01-08T12:00:00.000Z'));
    expect(getStartDate(PERIODS.ALL_TIME)).toEqual(new Date(0));
  });

  it('handles unknown period by defaulting to week', () => {
    expect(getStartDate('UNKNOWN_PERIOD')).toEqual(new Date('2024-01-01T12:00:00.000Z'));
  });

  it('filters workouts by period', () => {
    const workouts = [
      { date: '2024-01-07' },
      { date: '2023-12-20' },
      { date: '2023-10-01' }
    ];
    expect(filterWorkoutsByPeriod(workouts, PERIODS.WEEK)).toHaveLength(1);
    expect(filterWorkoutsByPeriod(workouts, PERIODS.MONTH)).toHaveLength(2);
    expect(filterWorkoutsByPeriod(workouts, PERIODS.YEAR)).toHaveLength(3);
  });

  it('handles empty workouts array', () => {
    expect(filterWorkoutsByPeriod([], PERIODS.WEEK)).toEqual([]);
  });

  it('calculates stats and ranking', () => {
    const workouts = [
      {
        date: '2024-01-07',
        exercises: [
          { name: 'Squat', sets: [{ reps: 5, weight: 100 }] },
          { name: 'Soulevé de terre', sets: [{ reps: 5, weight: 120 }] }
        ]
      },
      {
        date: '2023-12-31',
        exercises: [
          { name: 'Squat', sets: [{ reps: 5, weight: 110 }] }
        ]
      }
    ];
    const stats = calculateUserStats(workouts, PERIODS.ALL_TIME);
    expect(stats.workouts).toBe(2);
    expect(stats.maxWeight).toBe(120);
    const ranking = getLeaderboardRanking([
      { uid: 'a', displayName: 'A', stats },
      { uid: 'b', displayName: 'B', stats: { workouts: 1, maxWeight: 50 } }
    ], METRICS.WORKOUTS);
    expect(ranking[0].uid).toBe('a');
    expect(ranking[0].rank).toBe(1);
  });

  it('formats labels and exposes constants', () => {
    expect(formatMetricValue(5, METRICS.WORKOUTS)).toBe('5 séances');
    expect(getPeriodLabel(PERIODS.MONTH)).toBe('Ce mois');
    expect(getMetricLabel(METRICS.MAX_WEIGHT)).toBe('Poids max');
    expect(getAllowedExercises()).toEqual(ALLOWED_EXERCISES);
  });

  it('handles workouts without exercises', () => {
    const workouts = [
      { date: '2024-01-07' },
      { date: '2024-01-06', exercises: [] }
    ];
    const stats = calculateUserStats(workouts, PERIODS.ALL_TIME);
    expect(stats.workouts).toBe(2);
    expect(stats.maxWeight).toBe(0);
    expect(stats.exerciseStats).toEqual({});
  });

  it('filters out non-allowed exercises', () => {
    const workouts = [
      {
        date: '2024-01-07',
        exercises: [
          { name: 'Squat', sets: [{ reps: 5, weight: 100 }] },
          { name: 'Non-allowed Exercise', sets: [{ reps: 5, weight: 200 }] }
        ]
      }
    ];
    const stats = calculateUserStats(workouts, PERIODS.ALL_TIME);
    expect(stats.maxWeight).toBe(100); // Only allowed exercise weight
    expect(stats.exerciseStats['Non-allowed Exercise']).toBeUndefined();
  });

  it('handles exercises without sets', () => {
    const workouts = [
      {
        date: '2024-01-07',
        exercises: [
          { name: 'Squat', sets: [] }
        ]
      }
    ];
    const stats = calculateUserStats(workouts, PERIODS.ALL_TIME);
    expect(stats.exerciseStats['Squat'].maxWeight).toBe(0);
  });

  it('handles sets without weight', () => {
    const workouts = [
      {
        date: '2024-01-07',
        exercises: [
          { name: 'Squat', sets: [{ reps: 5 }, { reps: 5, weight: 100 }] }
        ]
      }
    ];
    const stats = calculateUserStats(workouts, PERIODS.ALL_TIME);
    expect(stats.maxWeight).toBe(100);
  });

  it('calculates exercise stats correctly', () => {
    const workouts = [
      {
        date: '2024-01-07',
        exercises: [
          { name: 'Squat', sets: [{ reps: 5, weight: 100 }, { reps: 5, weight: 110 }] }
        ]
      },
      {
        date: '2024-01-06',
        exercises: [
          { name: 'Squat', sets: [{ reps: 5, weight: 105 }] }
        ]
      }
    ];
    const stats = calculateUserStats(workouts, PERIODS.ALL_TIME);
    expect(stats.exerciseStats['Squat'].count).toBe(2);
    expect(stats.exerciseStats['Squat'].maxWeight).toBe(110);
  });

  it('handles ranking with equal values', () => {
    const usersStats = [
      { uid: 'a', displayName: 'A', stats: { workouts: 5, maxWeight: 100 } },
      { uid: 'b', displayName: 'B', stats: { workouts: 5, maxWeight: 100 } }
    ];
    const ranking = getLeaderboardRanking(usersStats, METRICS.WORKOUTS);
    expect(ranking[0].rank).toBe(1);
    expect(ranking[1].rank).toBe(2);
  });

  it('assigns medals correctly', () => {
    const usersStats = [
      { uid: 'a', displayName: 'A', stats: { workouts: 5, maxWeight: 100 } },
      { uid: 'b', displayName: 'B', stats: { workouts: 3, maxWeight: 80 } },
      { uid: 'c', displayName: 'C', stats: { workouts: 1, maxWeight: 60 } },
      { uid: 'd', displayName: 'D', stats: { workouts: 0, maxWeight: 40 } }
    ];
    const ranking = getLeaderboardRanking(usersStats, METRICS.WORKOUTS);
    expect(ranking[0].medal).toBe('🥇');
    expect(ranking[1].medal).toBe('🥈');
    expect(ranking[2].medal).toBe('🥉');
    expect(ranking[3].medal).toBeNull();
  });

  it('handles missing user properties', () => {
    const usersStats = [
      { uid: 'a', stats: { workouts: 5, maxWeight: 100 } }
    ];
    const ranking = getLeaderboardRanking(usersStats, METRICS.WORKOUTS);
    expect(ranking[0].displayName).toBeUndefined();
    expect(ranking[0].nickname).toBe('');
  });

  it('handles unknown metric in ranking', () => {
    const usersStats = [
      { uid: 'a', displayName: 'A', stats: { workouts: 5, maxWeight: 100 } }
    ];
    const ranking = getLeaderboardRanking(usersStats, 'UNKNOWN_METRIC');
    expect(ranking[0].value).toBe(0);
  });

  it('handles missing stats in ranking', () => {
    const usersStats = [
      { uid: 'a', displayName: 'A' }
    ];
    const ranking = getLeaderboardRanking(usersStats, METRICS.WORKOUTS);
    expect(ranking[0].value).toBe(0);
  });

  it('filters workouts by specific period correctly', () => {
    const workouts = [
      { date: '2024-01-07' }, // This week
      { date: '2024-01-01' }, // This week
      { date: '2023-12-31' }, // Last week
      { date: '2023-12-01' }  // Last month
    ];
    
    const weekWorkouts = filterWorkoutsByPeriod(workouts, PERIODS.WEEK);
    expect(weekWorkouts).toHaveLength(1); // Only 2024-01-07 is in this week
    expect(weekWorkouts[0].date).toBe('2024-01-07');
  });

  it('handles workouts with invalid dates', () => {
    const workouts = [
      { date: 'invalid-date' },
      { date: '2024-01-07' }
    ];
    const filtered = filterWorkoutsByPeriod(workouts, PERIODS.WEEK);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].date).toBe('2024-01-07');
  });

  it('calculates stats for specific period', () => {
    const workouts = [
      {
        date: '2024-01-07', // This week
        exercises: [
          { name: 'Squat', sets: [{ reps: 5, weight: 100 }] }
        ]
      },
      {
        date: '2023-12-31', // Last week
        exercises: [
          { name: 'Squat', sets: [{ reps: 5, weight: 120 }] }
        ]
      }
    ];
    
    const weekStats = calculateUserStats(workouts, PERIODS.WEEK);
    expect(weekStats.workouts).toBe(1);
    expect(weekStats.maxWeight).toBe(100);
    
    const allTimeStats = calculateUserStats(workouts, PERIODS.ALL_TIME);
    expect(allTimeStats.workouts).toBe(2);
    expect(allTimeStats.maxWeight).toBe(120);
  });
});
