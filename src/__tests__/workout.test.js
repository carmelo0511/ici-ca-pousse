// Tests pour les fonctionnalités de workout
describe('Workout Functionality', () => {
  test('workout creation and validation', () => {
    const createWorkout = (date, exercises, startTime, endTime) => {
      if (!date || !Array.isArray(exercises) || exercises.length === 0) {
        return null;
      }

      return {
        id: Date.now().toString(),
        date,
        exercises,
        startTime: startTime || '00:00',
        endTime: endTime || '00:00',
        duration: calculateDuration(startTime || '00:00', endTime || '00:00'),
        createdAt: new Date().toISOString()
      };
    };

    const calculateDuration = (start, end) => {
      const [startHour, startMin] = start.split(':').map(Number);
      const [endHour, endMin] = end.split(':').map(Number);
      
      let startMinutes = startHour * 60 + startMin;
      let endMinutes = endHour * 60 + endMin;
      
      if (endMinutes < startMinutes) {
        endMinutes += 24 * 60; // Handle overnight
      }
      
      return endMinutes - startMinutes;
    };

    const validWorkout = createWorkout(
      '2024-01-15',
      [{ name: 'Push-ups', sets: 3 }],
      '10:00',
      '11:00'
    );

    expect(validWorkout).not.toBeNull();
    expect(validWorkout.exercises).toHaveLength(1);
    expect(validWorkout.duration).toBe(60);
    expect(validWorkout.date).toBe('2024-01-15');

    // Invalid workout (no exercises)
    const invalidWorkout = createWorkout('2024-01-15', [], '10:00', '11:00');
    expect(invalidWorkout).toBeNull();
  });

  test('exercise management', () => {
    let exercises = [];

    const addExercise = (name, muscleGroup) => {
      if (!name || name.trim() === '') return false;
      
      const exercise = {
        id: Date.now(),
        name: name.trim(),
        muscleGroup: muscleGroup || 'Unknown',
        sets: [],
        createdAt: new Date().toISOString()
      };
      
      exercises.push(exercise);
      return true;
    };

    const removeExercise = (id) => {
      const initialLength = exercises.length;
      exercises = exercises.filter(ex => ex.id !== id);
      return exercises.length < initialLength;
    };

    const addSet = (exerciseId, weight, reps) => {
      const exercise = exercises.find(ex => ex.id === exerciseId);
      if (!exercise) return false;

      exercise.sets.push({
        id: Date.now(),
        weight: weight || 0,
        reps: reps || 0,
        completed: false
      });
      return true;
    };

    // Test adding exercises
    expect(addExercise('Push-ups', 'Chest')).toBe(true);
    expect(addExercise('', 'Chest')).toBe(false); // Empty name
    expect(exercises).toHaveLength(1);
    expect(exercises[0].name).toBe('Push-ups');
    expect(exercises[0].muscleGroup).toBe('Chest');

    // Test adding sets
    const exerciseId = exercises[0].id;
    expect(addSet(exerciseId, 80, 10)).toBe(true);
    expect(addSet(999, 80, 10)).toBe(false); // Invalid exercise ID
    expect(exercises[0].sets).toHaveLength(1);
    expect(exercises[0].sets[0].weight).toBe(80);
    expect(exercises[0].sets[0].reps).toBe(10);

    // Test removing exercises
    expect(removeExercise(exerciseId)).toBe(true);
    expect(removeExercise(999)).toBe(false); // Invalid ID
    expect(exercises).toHaveLength(0);
  });

  test('workout statistics calculation', () => {
    const calculateStats = (workouts) => {
      if (!Array.isArray(workouts) || workouts.length === 0) {
        return {
          totalWorkouts: 0,
          totalDuration: 0,
          averageDuration: 0,
          totalExercises: 0,
          averageExercisesPerWorkout: 0,
          mostUsedMuscleGroup: null,
          currentStreak: 0
        };
      }

      const totalWorkouts = workouts.length;
      const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
      const totalExercises = workouts.reduce((sum, w) => sum + (w.exercises?.length || 0), 0);

      // Count muscle groups
      const muscleGroups = {};
      workouts.forEach(workout => {
        workout.exercises?.forEach(exercise => {
          const group = exercise.muscleGroup || 'Unknown';
          muscleGroups[group] = (muscleGroups[group] || 0) + 1;
        });
      });

      const mostUsedMuscleGroup = Object.keys(muscleGroups).reduce((max, group) => 
        !max || muscleGroups[group] > muscleGroups[max] ? group : max, null);

      // Calculate streak (simplified)
      const currentStreak = calculateCurrentStreak(workouts);

      return {
        totalWorkouts,
        totalDuration,
        averageDuration: Math.round(totalDuration / totalWorkouts),
        totalExercises,
        averageExercisesPerWorkout: Math.round(totalExercises / totalWorkouts * 10) / 10,
        mostUsedMuscleGroup,
        currentStreak
      };
    };

    const calculateCurrentStreak = (workouts) => {
      // Simplified streak calculation
      if (workouts.length === 0) return 0;
      
      const sortedWorkouts = workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
      let streak = 0;
      let currentDate = new Date();
      
      for (const workout of sortedWorkouts) {
        const workoutDate = new Date(workout.date);
        const daysDiff = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= streak + 1) {
          streak++;
          currentDate = workoutDate;
        } else {
          break;
        }
      }
      
      return streak;
    };

    const testWorkouts = [
      {
        date: '2024-01-15',
        duration: 60,
        exercises: [
          { name: 'Push-ups', muscleGroup: 'Chest' },
          { name: 'Squats', muscleGroup: 'Legs' }
        ]
      },
      {
        date: '2024-01-16',
        duration: 45,
        exercises: [
          { name: 'Pull-ups', muscleGroup: 'Back' },
          { name: 'Bench Press', muscleGroup: 'Chest' }
        ]
      }
    ];

    const stats = calculateStats(testWorkouts);
    expect(stats.totalWorkouts).toBe(2);
    expect(stats.totalDuration).toBe(105);
    expect(stats.averageDuration).toBe(53); // (60 + 45) / 2 = 52.5, rounded to 53
    expect(stats.totalExercises).toBe(4);
    expect(stats.averageExercisesPerWorkout).toBe(2.0);
    expect(stats.mostUsedMuscleGroup).toBe('Chest'); // Appears 2 times

    // Empty workouts
    const emptyStats = calculateStats([]);
    expect(emptyStats.totalWorkouts).toBe(0);
    expect(emptyStats.averageDuration).toBe(0);
    expect(emptyStats.mostUsedMuscleGroup).toBeNull();
  });

  test('workout template functionality', () => {
    let templates = [];

    const saveTemplate = (name, exercises) => {
      if (!name || !exercises || exercises.length === 0) return false;

      const template = {
        id: Date.now().toString(),
        name: name.trim(),
        exercises: exercises.map(ex => ({
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          sets: ex.sets?.map(set => ({
            weight: set.weight,
            reps: set.reps
          })) || []
        })),
        createdAt: new Date().toISOString(),
        usageCount: 0
      };

      templates.push(template);
      return template;
    };

    const loadTemplate = (templateId) => {
      const template = templates.find(t => t.id === templateId);
      if (!template) return null;

      template.usageCount++;
      return {
        exercises: template.exercises.map(ex => ({
          ...ex,
          id: Date.now() + Math.random(), // New IDs for loaded exercises
          sets: ex.sets.map(set => ({ ...set, id: Date.now() + Math.random() }))
        }))
      };
    };

    const deleteTemplate = (templateId) => {
      const initialLength = templates.length;
      templates = templates.filter(t => t.id !== templateId);
      return templates.length < initialLength;
    };

    // Test saving templates
    const exercisesData = [
      { name: 'Push-ups', muscleGroup: 'Chest', sets: [{ weight: 0, reps: 20 }] },
      { name: 'Squats', muscleGroup: 'Legs', sets: [{ weight: 60, reps: 15 }] }
    ];

    const template = saveTemplate('Upper Body', exercisesData);
    expect(template).not.toBe(false);
    expect(template.name).toBe('Upper Body');
    expect(template.exercises).toHaveLength(2);
    expect(template.usageCount).toBe(0);
    expect(templates).toHaveLength(1);

    // Test invalid template
    expect(saveTemplate('', [])).toBe(false);
    expect(saveTemplate('Test', [])).toBe(false);

    // Test loading templates
    const loaded = loadTemplate(template.id);
    expect(loaded).not.toBeNull();
    expect(loaded.exercises).toHaveLength(2);
    expect(templates[0].usageCount).toBe(1);

    // Test invalid load
    expect(loadTemplate('invalid-id')).toBeNull();

    // Test deleting templates
    expect(deleteTemplate(template.id)).toBe(true);
    expect(deleteTemplate('invalid-id')).toBe(false);
    expect(templates).toHaveLength(0);
  });
});