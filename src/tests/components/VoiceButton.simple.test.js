import VoiceButton from '../../components/VoiceButton';

describe('VoiceButton Component - Structure Tests', () => {
  test('should have VoiceButton file', () => {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../../components/VoiceButton.jsx');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('should export VoiceButton component', () => {
    const VoiceButton = require('../../components/VoiceButton').default;
    expect(typeof VoiceButton).toBe('function');
  });

  test('should have correct file structure', () => {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../../components/VoiceButton.jsx');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier que le fichier contient les éléments essentiels
    expect(content).toContain('React');
    expect(content).toContain('useState');
    expect(content).toContain('useEffect');
    expect(content).toContain('Mic');
    expect(content).toContain('MicOff');
    expect(content).toContain('Loader');
    expect(content).toContain('export default');
  });
}); 