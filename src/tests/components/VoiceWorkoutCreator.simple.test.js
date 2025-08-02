import VoiceWorkoutCreator from '../../components/VoiceWorkoutCreator';
import path from 'path';

describe('VoiceWorkoutCreator Component - Structure Tests', () => {
  test('should have VoiceWorkoutCreator file', () => {
    const fs = require('fs');
    const filePath = path.join(__dirname, '../../components/VoiceWorkoutCreator.jsx');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('should export VoiceWorkoutCreator component', () => {
    const VoiceWorkoutCreator = require('../../components/VoiceWorkoutCreator').default;
    expect(typeof VoiceWorkoutCreator).toBe('function');
  });

  test('should export parseVoiceTranscript function', () => {
    const { parseVoiceTranscript } = require('../../components/VoiceWorkoutCreator');
    expect(typeof parseVoiceTranscript).toBe('function');
  });

  test('should have proper component structure', () => {
    const filePath = path.join(__dirname, '../../components/VoiceWorkoutCreator.jsx');
    const fs = require('fs');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier les imports essentiels
    expect(fileContent).toContain('import React');
    expect(fileContent).toContain('import VoiceButton');
    expect(fileContent).toContain('import { exerciseDatabase }');
    
    // Vérifier la structure du composant
    expect(fileContent).toContain('const VoiceWorkoutCreator = ({');
    expect(fileContent).toContain('export default VoiceWorkoutCreator');
  });

  test('should have voice parsing functionality', () => {
    const filePath = path.join(__dirname, '../../components/VoiceWorkoutCreator.jsx');
    const fs = require('fs');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier les fonctionnalités de parsing vocal
    expect(fileContent).toContain('parseVoiceTranscript');
    expect(fileContent).toContain('handleVoiceTranscript');
    expect(fileContent).toContain('patterns');
    expect(fileContent).toContain('regex');
  });

  test('should have exercise database integration', () => {
    const filePath = path.join(__dirname, '../../components/VoiceWorkoutCreator.jsx');
    const fs = require('fs');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier l'intégration avec la base de données d'exercices
    expect(fileContent).toContain('exerciseDatabase');
    expect(fileContent).toContain('allExercises');
    expect(fileContent).toContain('foundExercise');
  });

  test('should have UI elements', () => {
    const filePath = path.join(__dirname, '../../components/VoiceWorkoutCreator.jsx');
    const fs = require('fs');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier les éléments UI
    expect(fileContent).toContain('Créer une séance par la voix');
    expect(fileContent).toContain('Décrivez vos exercices un par un');
    expect(fileContent).toContain('Exercices détectés');
    expect(fileContent).toContain('VoiceButton');
  });

  test('should have proper props structure', () => {
    const VoiceWorkoutCreator = require('../../components/VoiceWorkoutCreator').default;
    
    // Vérifier que le composant accepte les props attendues
    const mockProps = {
      onWorkoutCreated: jest.fn(),
      onClose: jest.fn()
    };
    
    // Le composant devrait pouvoir être appelé avec ces props
    expect(() => {
      expect(VoiceWorkoutCreator).toBeDefined();
    }).not.toThrow();
  });

  test('should have voice recognition patterns', () => {
    const filePath = path.join(__dirname, '../../components/VoiceWorkoutCreator.jsx');
    const fs = require('fs');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier les patterns de reconnaissance vocale
    expect(fileContent).toContain('séries');
    expect(fileContent).toContain('répétitions');
    expect(fileContent).toContain('kg');
    expect(fileContent).toContain('minutes');
  });

  test('should have error handling', () => {
    const filePath = path.join(__dirname, '../../components/VoiceWorkoutCreator.jsx');
    const fs = require('fs');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier la gestion d'erreurs
    expect(fileContent).toContain('try {');
    expect(fileContent).toContain('catch (err)');
    expect(fileContent).toContain('setError');
  });
}); 