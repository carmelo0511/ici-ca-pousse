import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { STORAGE_KEYS } from '../constants';

const ThemeToggleBubble = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    return savedTheme || 'light';
  });

  // Logique de thème
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved) {
      setTheme(saved);
      document.body.classList.toggle('dark', saved === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
      document.body.classList.toggle('dark', prefersDark);
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <>
      {/* Bulle flottante simple */}
      <div style={{ position: 'fixed', bottom: 24, right: 100, zIndex: 1000 }}>
        <button
          onClick={toggleTheme}
          className="bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center relative hover:scale-105 transition-all"
          aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
        >
          {theme === 'dark' ?
            <Sun className="w-7 h-7 text-yellow-300" /> :
            <Moon className="w-7 h-7 text-blue-200" />
          }
        </button>
      </div>
    </>
  );
};

export default ThemeToggleBubble; 