import useVoice from '../../hooks/useVoice';

// Mock Web Speech API
const mockSpeechRecognition = {
  continuous: false,
  interimResults: false,
  lang: '',
  onstart: null,
  onresult: null,
  onerror: null,
  onend: null,
  start: jest.fn(),
  stop: jest.fn(),
};

// Mock global SpeechRecognition
global.SpeechRecognition = jest.fn(() => mockSpeechRecognition);
global.webkitSpeechRecognition = jest.fn(() => mockSpeechRecognition);

describe('useVoice Hook - Structure Tests', () => {
  test('should have useVoice file', () => {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../../hooks/useVoice.js');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('should export useVoice function', () => {
    const useVoice = require('../../hooks/useVoice').default;
    expect(typeof useVoice).toBe('function');
  });

  test('should have correct file structure', () => {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../../hooks/useVoice.js');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier que le fichier contient les éléments essentiels
    expect(content).toContain('useState');
    expect(content).toContain('useEffect');
    expect(content).toContain('useCallback');
    expect(content).toContain('SpeechRecognition');
    expect(content).toContain('export default');
  });
}); 