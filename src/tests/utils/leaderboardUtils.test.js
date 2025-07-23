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
});
