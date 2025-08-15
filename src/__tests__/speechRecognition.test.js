import { renderHook } from '@testing-library/react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

// Mock window.speechRecognition car il n'est pas disponible dans l'environnement de test
Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: class MockSpeechRecognition {
    constructor() {
      this.continuous = true;
      this.interimResults = true;
      this.lang = 'fr-FR';
      this.maxAlternatives = 1;
    }
    
    start() {}
    stop() {}
  },
  writable: true,
});

describe('useSpeechRecognition', () => {
  test('parseWorkoutDataFromSpeech should parse simple workout data', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    
    // Test parsing de séries
    const setsResult = result.current.parseWorkoutDataFromSpeech('3 séries');
    expect(setsResult.sets).toBe(3);
    expect(setsResult.found).toBe(true);
    
    // Test parsing de répétitions
    const repsResult = result.current.parseWorkoutDataFromSpeech('12 répétitions');
    expect(repsResult.reps).toBe(12);
    expect(repsResult.found).toBe(true);
    
    // Test parsing de poids
    const weightResult = result.current.parseWorkoutDataFromSpeech('50 kg');
    expect(weightResult.weight).toBe(50);
    expect(weightResult.found).toBe(true);
  });

  test('parseWorkoutDataFromSpeech should parse complex workout data', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    
    // Test parsing de phrase complexe
    const complexResult = result.current.parseWorkoutDataFromSpeech('3 séries de 12 répétitions à 50 kg');
    expect(complexResult.sets).toBe(3);
    expect(complexResult.reps).toBe(12);
    expect(complexResult.weight).toBe(50);
    expect(complexResult.found).toBe(true);
    
    // Test autre format
    const altResult = result.current.parseWorkoutDataFromSpeech('12 répétitions à 75 kilos');
    expect(altResult.reps).toBe(12);
    expect(altResult.weight).toBe(75);
    expect(altResult.found).toBe(true);
    
    // Test avec nombres en lettres (cas de l'utilisateur)
    const userResult = result.current.parseWorkoutDataFromSpeech('quatre séries de 12 répétitions à 20 kg');
    expect(userResult.sets).toBe(4);
    expect(userResult.reps).toBe(12);
    expect(userResult.weight).toBe(20);
    expect(userResult.found).toBe(true);
  });

  test('parseWorkoutDataFromSpeech should handle invalid values', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    
    // Test valeurs invalides
    const invalidResult = result.current.parseWorkoutDataFromSpeech('500 séries');
    expect(invalidResult.sets).toBe(null); // Devrait être null car > 20
    
    const validResult = result.current.parseWorkoutDataFromSpeech('5 séries');
    expect(validResult.sets).toBe(5); // Devrait être valide
  });

  test('parseExerciseFromSpeech should recognize exercises', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    
    // Test reconnaissance d'exercice simple
    const exerciseResult = result.current.parseExerciseFromSpeech('pompes');
    expect(exerciseResult.name).toBe('Pompes');
    expect(exerciseResult.found).toBe(true);
    
    // Test exercice non reconnu
    const unknownResult = result.current.parseExerciseFromSpeech('exercice inexistant xyz');
    expect(unknownResult.found).toBe(false);
  });

  test('getMuscleGroupFromExercise should return correct muscle group', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    
    // Test groupe musculaire pour pompes
    const muscleGroup = result.current.getMuscleGroupFromExercise('Pompes');
    expect(muscleGroup).toBe('pectoraux');
    
    // Test groupe musculaire pour squats
    const squatMuscleGroup = result.current.getMuscleGroupFromExercise('Squat');
    expect(squatMuscleGroup).toBe('jambes');
  });
});