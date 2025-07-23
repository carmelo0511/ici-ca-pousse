import {
  parseLocalDate,
  createWorkout,
  calculateWorkoutStats,
  formatDate,
  getCurrentDate,
  getBadges,
  analyzeWorkoutHabits,
  getPreferredWorkoutTime,
  getAverageDurationByTime,
  getWorkoutsForDateRange,
  cleanWorkoutForFirestore
} from '../../utils/workoutUtils';

describe('workoutUtils', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-08T12:00:00Z'));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('parses local dates', () => {
    const d = parseLocalDate('2024-01-05');
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(5);
    expect(parseLocalDate(null)).toBeNull();
  });

  it('creates workouts and calculates stats', () => {
    const workout = createWorkout([{ name: 'Squat', sets: [{ reps: 5, weight: 100 }] }], '2024-01-05', 45, 'id', '10:00', '11:00');
    expect(workout.totalSets).toBe(1);
    expect(workout.totalReps).toBe(5);
    expect(workout.totalWeight).toBe(500);
    const stats = calculateWorkoutStats([workout]);
    expect(stats.totalWorkouts).toBe(1);
  });

  it('formats date and gets current date', () => {
    const spy = jest.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue('lun. 08 janv.');
    expect(formatDate('2024-01-08')).toBe('lun. 08 janv.');
    expect(getCurrentDate()).toBe('2024-01-08');
    spy.mockRestore();
  });

  it('generates badges', () => {
    const badges = getBadges({ totalWorkouts: 10, totalSets: 120, totalReps: 1500, totalWeight: 12000, avgDuration: 61 });
    expect(badges.length).toBeGreaterThan(0);
  });

  it('analyses habits and preferences', () => {
    const workouts = [
      { startTime: '06:00', duration: 30 },
      { startTime: '14:00', duration: 45 },
      { startTime: '20:00', duration: 20 },
      { startTime: '23:00', duration: 40 }
    ];
    const habits = analyzeWorkoutHabits(workouts);
    expect(habits.night.count).toBe(1);
    const pref = getPreferredWorkoutTime(workouts);
    expect(pref.name).toBe('matin');
    const avg = getAverageDurationByTime(workouts.map(w => ({ ...w, date: '2024-01-05' })));
    expect(avg.afternoon).toBe(45);
  });

  it('filters workouts and cleans for firestore', () => {
    const ws = [{ date: '2024-01-05' }, { date: '2024-01-10' }];
    const range = getWorkoutsForDateRange(ws, new Date('2024-01-07'), new Date('2024-01-12'));
    expect(range).toHaveLength(1);
    const cleaned = cleanWorkoutForFirestore({ a: 1, b: null, c: { d: 2, e: undefined } });
    expect(cleaned).toEqual({ a: 1, c: { d: 2 } });
  });
});
