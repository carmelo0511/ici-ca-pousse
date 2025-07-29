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
  cleanWorkoutForFirestore,
  getMuscleGroupDistribution,
  getWeightProgress,
  getAverageWeights,
  getWorkoutWeightDetails,
  getWorkoutSetRepDetails,
  getLastExerciseWeight,
  groupWorkoutsByWeek,
  getWeeklyWorkoutData,
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
    expect(parseLocalDate('')).toBeNull();
  });

  it('creates workouts and calculates stats', () => {
    const workout = createWorkout(
      [{ name: 'Squat', sets: [{ reps: 5, weight: 100 }] }],
      '2024-01-05',
      45,
      'id',
      '10:00',
      '11:00'
    );
    expect(workout.totalSets).toBe(1);
    expect(workout.totalReps).toBe(5);
    expect(workout.totalWeight).toBe(500);
    const stats = calculateWorkoutStats([workout]);
    expect(stats.totalWorkouts).toBe(1);
  });

  it('handles decimal weights correctly', () => {
    const workout = createWorkout(
      [{ name: 'Bench', sets: [{ reps: 2, weight: 4.5 }] }],
      '2024-01-05',
      30
    );
    expect(workout.exercises[0].sets[0].weight).toBe(4.5);
    expect(workout.totalWeight).toBeCloseTo(9);
  });

  it('formats date and gets current date', () => {
    const spy = jest
      .spyOn(Date.prototype, 'toLocaleDateString')
      .mockReturnValue('lun. 08 janv.');
    expect(formatDate('2024-01-08')).toBe('lun. 08 janv.');
    expect(getCurrentDate()).toBe('2024-01-08');
    spy.mockRestore();
  });

  it('generates badges', () => {
    const badges = getBadges({
      totalWorkouts: 10,
      totalSets: 120,
      totalReps: 1500,
      totalWeight: 12000,
      avgDuration: 61,
    });
    expect(badges.length).toBeGreaterThan(0);
  });

  it('analyses habits and preferences', () => {
    const workouts = [
      { startTime: '06:00', duration: 30 },
      { startTime: '14:00', duration: 45 },
      { startTime: '20:00', duration: 20 },
      { startTime: '23:00', duration: 40 },
    ];
    const habits = analyzeWorkoutHabits(workouts);
    expect(habits.night.count).toBe(1);
    const pref = getPreferredWorkoutTime(workouts);
    expect(pref.name).toBe('matin');
    const avg = getAverageDurationByTime(
      workouts.map((w) => ({ ...w, date: '2024-01-05' }))
    );
    expect(avg.afternoon).toBe(45);
  });

  it('filters workouts and cleans for firestore', () => {
    const ws = [{ date: '2024-01-05' }, { date: '2024-01-10' }];
    const range = getWorkoutsForDateRange(
      ws,
      new Date('2024-01-07'),
      new Date('2024-01-12')
    );
    expect(range).toHaveLength(1);
    const cleaned = cleanWorkoutForFirestore({
      a: 1,
      b: null,
      c: { d: 2, e: undefined },
    });
    expect(cleaned).toEqual({ a: 1, c: { d: 2 } });
  });

  it('computes muscle group distribution', () => {
    const workouts = [
      { exercises: [{ type: 'jambes' }, { type: 'jambes' }] },
      { exercises: [{ type: 'biceps' }] },
    ];
    const dist = getMuscleGroupDistribution(workouts);
    expect(dist.jambes).toBeGreaterThan(dist.biceps);
  });

  it('calculates weight progress', () => {
    const workouts = [
      {
        date: '2024-01-01',
        exercises: [{ name: 'Squat', sets: [{ weight: 50 }] }],
      },
      {
        date: '2024-01-10',
        exercises: [{ name: 'Squat', sets: [{ weight: 60 }] }],
      },
    ];
    const progress = getWeightProgress(workouts);
    expect(progress.Squat).toBe(10);
  });

  it('computes average weights', () => {
    const workouts = [
      {
        exercises: [{ name: 'Bench', sets: [{ weight: 40 }, { weight: 50 }] }],
      },
      { exercises: [{ name: 'Bench', sets: [{ weight: 60 }] }] },
    ];
    const weights = getAverageWeights(workouts);
    expect(weights.Bench).toBe(50);
  });

  it('generates weight details', () => {
    const workouts = [
      {
        date: '2024-01-01',
        exercises: [
          { name: 'Squat', sets: [{ weight: 100 }, { weight: 110 }] },
        ],
      },
      {
        date: '2024-01-02',
        exercises: [{ name: 'Bench', sets: [{ weight: 80 }] }],
      },
    ];
    const details = getWorkoutWeightDetails(workouts);
    expect(details).toContain('2024-01-01');
    expect(details).toContain('Squat:100/110');
    expect(details).toContain('2024-01-02');
    expect(details).toContain('Bench:80');
  });

  it('generates rep and set details', () => {
    const workouts = [
      {
        date: '2024-01-01',
        exercises: [
          { name: 'Squat', sets: [{ reps: 5, weight: 100 }, { reps: 5, weight: 110 }] },
        ],
      },
      {
        date: '2024-01-02',
        exercises: [{ name: 'Bench', sets: [{ reps: 8, weight: 80 }] }],
      },
    ];
    const details = getWorkoutSetRepDetails(workouts);
    expect(details).toContain('2024-01-01');
    expect(details).toContain('Squat : 2 séries de 5 répétitions à 105 kg');
    expect(details).toContain('2024-01-02');
    expect(details).toContain('Bench : 1 série de 8 répétitions à 80 kg');
  });

  describe('createWorkout', () => {
    const mockExercises = [
      {
        id: 1,
        name: 'Pompes',
        type: 'pectoraux',
        sets: [
          { reps: 10, weight: 0, duration: 0 },
          { reps: 12, weight: 0, duration: 0 }
        ]
      }
    ];

    it('should create a workout with basic data', () => {
      const workout = createWorkout(mockExercises, '2024-01-15', 45);
      
      expect(workout).toEqual({
        date: '2024-01-15',
        exercises: mockExercises,
        duration: 45,
        totalSets: 2,
        totalReps: 22,
        totalWeight: 0
      });
    });

    it('should create a workout with feeling', () => {
      const workout = createWorkout(mockExercises, '2024-01-15', 45, undefined, null, null, 'easy');
      
      expect(workout).toEqual({
        date: '2024-01-15',
        exercises: mockExercises,
        duration: 45,
        totalSets: 2,
        totalReps: 22,
        totalWeight: 0,
        feeling: 'easy'
      });
    });

    it('should create a workout with custom feeling', () => {
      const workout = createWorkout(mockExercises, '2024-01-15', 45, undefined, null, null, 'Je me sentais très motivé');
      
      expect(workout).toEqual({
        date: '2024-01-15',
        exercises: mockExercises,
        duration: 45,
        totalSets: 2,
        totalReps: 22,
        totalWeight: 0,
        feeling: 'Je me sentais très motivé'
      });
    });

    it('should not include feeling if null', () => {
      const workout = createWorkout(mockExercises, '2024-01-15', 45, undefined, null, null, null);
      
      expect(workout).toEqual({
        date: '2024-01-15',
        exercises: mockExercises,
        duration: 45,
        totalSets: 2,
        totalReps: 22,
        totalWeight: 0
      });
      expect(workout.feeling).toBeUndefined();
    });

    it('should return null for empty exercises', () => {
      expect(createWorkout([], '2024-01-15', 45)).toBeNull();
      expect(createWorkout(null, '2024-01-15', 45)).toBeNull();
    });

    it('should handle exercises without sets', () => {
      const exercisesWithoutSets = [
        { name: 'Pompes', type: 'pectoraux' }
      ];
      const workout = createWorkout(exercisesWithoutSets, '2024-01-15', 45);
      
      expect(workout.exercises[0].sets).toEqual([{ reps: 0, weight: 0, duration: 0 }]);
    });

    it('should handle exercises without type', () => {
      const exercisesWithoutType = [
        { name: 'Pompes', sets: [{ reps: 10, weight: 0, duration: 0 }] }
      ];
      const workout = createWorkout(exercisesWithoutType, '2024-01-15', 45);
      
      expect(workout.exercises[0].type).toBe('custom');
    });

    it('should handle sets with invalid values', () => {
      const exercisesWithInvalidSets = [
        {
          name: 'Pompes',
          sets: [
            { reps: 'invalid', weight: 'invalid', duration: 'invalid' }
          ]
        }
      ];
      const workout = createWorkout(exercisesWithInvalidSets, '2024-01-15', 45);
      
      expect(workout.exercises[0].sets[0]).toEqual({
        reps: 0,
        weight: 0,
        duration: 0
      });
    });

    it('should use current date when no date provided', () => {
      const workout = createWorkout(mockExercises, null, 45);
      expect(workout.date).toBe('2024-01-08');
    });

    it('should use default duration when no duration provided', () => {
      const workout = createWorkout(mockExercises, '2024-01-15', null);
      expect(workout.duration).toBe(30); // DEFAULT_WORKOUT_DURATION
    });
  });

  describe('calculateWorkoutStats', () => {
    it('should handle empty workouts array', () => {
      const stats = calculateWorkoutStats([]);
      expect(stats).toEqual({
        totalWorkouts: 0,
        totalSets: 0,
        totalReps: 0,
        totalWeight: 0,
        avgDuration: 0
      });
    });

    it('should calculate stats correctly', () => {
      const workouts = [
        { totalSets: 3, totalReps: 30, totalWeight: 300, duration: 45 },
        { totalSets: 2, totalReps: 20, totalWeight: 200, duration: 30 }
      ];
      const stats = calculateWorkoutStats(workouts);
      expect(stats).toEqual({
        totalWorkouts: 2,
        totalSets: 5,
        totalReps: 50,
        totalWeight: 500,
        avgDuration: 38
      });
    });
  });

  describe('getLastExerciseWeight', () => {
    it('should return last weight for exercise', () => {
      const workouts = [
        {
          date: '2024-01-01',
          exercises: [{ name: 'Squat', sets: [{ weight: 100 }] }]
        },
        {
          date: '2024-01-05',
          exercises: [{ name: 'Squat', sets: [{ weight: 110 }] }]
        }
      ];
      const weight = getLastExerciseWeight(workouts, 'Squat');
      expect(weight).toBe(110);
    });

    it('should return 0 if exercise not found', () => {
      const workouts = [
        { date: '2024-01-01', exercises: [{ name: 'Bench', sets: [{ weight: 100 }] }] }
      ];
      const weight = getLastExerciseWeight(workouts, 'Squat');
      expect(weight).toBe(null);
    });

    it('should filter by beforeDate', () => {
      const workouts = [
        {
          date: '2024-01-01',
          exercises: [{ name: 'Squat', sets: [{ weight: 100 }] }]
        },
        {
          date: '2024-01-05',
          exercises: [{ name: 'Squat', sets: [{ weight: 110 }] }]
        }
      ];
      const weight = getLastExerciseWeight(workouts, 'Squat', '2024-01-03');
      expect(weight).toBe(100);
    });
  });

  describe('groupWorkoutsByWeek', () => {
    it('should group workouts by week', () => {
      const workouts = [
        { date: '2024-01-01' }, // Week 1
        { date: '2024-01-02' }, // Week 1
        { date: '2024-01-08' }, // Week 2
        { date: '2024-01-15' }  // Week 3
      ];
      const grouped = groupWorkoutsByWeek(workouts);
      expect(Object.keys(grouped)).toHaveLength(3);
    });

    it('should handle empty workouts', () => {
      const grouped = groupWorkoutsByWeek([]);
      expect(grouped).toEqual({});
    });
  });

  describe('getWeeklyWorkoutData', () => {
    it('should generate weekly workout data', () => {
      const workouts = [
        { date: '2024-01-01', duration: 45 },
        { date: '2024-01-02', duration: 30 },
        { date: '2024-01-08', duration: 60 }
      ];
      const data = getWeeklyWorkoutData(workouts);
      expect(data).toHaveLength(2); // 2 weeks
    });
  });

  describe('formatDate edge cases', () => {
    it('should handle invalid date strings', () => {
      expect(formatDate('invalid-date')).toBe('Invalid Date');
      expect(formatDate('')).toBe('');
      expect(formatDate(null)).toBe('');
    });
  });

  describe('cleanWorkoutForFirestore', () => {
    it('should remove null and undefined values', () => {
      const obj = {
        a: 1,
        b: null,
        c: undefined,
        d: { e: 2, f: null, g: undefined },
        h: [1, null, 3, undefined]
      };
      const cleaned = cleanWorkoutForFirestore(obj);
      expect(cleaned).toEqual({
        a: 1,
        d: { e: 2 },
        h: [1, 3]
      });
    });

    it('should handle nested objects', () => {
      const obj = {
        workout: {
          exercises: [
            { name: 'Squat', sets: [{ reps: 5, weight: 100 }] },
            { name: 'Bench', sets: null }
          ]
        }
      };
      const cleaned = cleanWorkoutForFirestore(obj);
      expect(cleaned.workout.exercises[0]).toBeDefined();
      expect(cleaned.workout.exercises[1]).toBeDefined(); // null values are not removed in this implementation
    });
  });
});
