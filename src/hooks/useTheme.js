import { useState, useEffect } from 'react';
import { load, save } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';

export const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = load(STORAGE_KEYS.THEME, 'light');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    // Sauvegarder le thème dans localStorage
    save(STORAGE_KEYS.THEME, isDarkMode ? 'dark' : 'light');
    
    // Appliquer le thème au body
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return {
    isDarkMode,
    toggleTheme
  };
}; 