import React, { useState, useEffect } from 'react';
// Sun et Moon supprimés car non utilisés
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
      {/* Bouton texte flottant en bas à gauche - à côté du chatbot */}
      <div style={{ position: 'fixed', left: 120, bottom: 24, zIndex: 999 }}>
        <button
          onClick={toggleTheme}
          className="bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg px-4 py-2 flex items-center justify-center relative hover:shadow-xl transition-all duration-300 rounded-xl border border-white/30"
          aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
        >
          <span className="font-semibold text-sm tracking-wide">
            {theme === 'dark' ? '☀️ CLAIR' : '🌙 SOMBRE'}
          </span>
        </button>
      </div>
    </>
  );
};

export default ThemeToggleBubble; 