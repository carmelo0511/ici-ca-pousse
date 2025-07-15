import React from 'react';
import { Dumbbell } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Header = ({ workoutCount, isDarkMode, toggleTheme }) => {
  return (
    <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg">
              <Dumbbell className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Ici Ca Pousse
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {workoutCount} séance{workoutCount !== 1 ? 's' : ''} effectuée{workoutCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 px-4 py-2 rounded-xl border border-green-200 dark:border-green-700">
              <span className="text-sm font-bold text-green-800 dark:text-green-200">📱 Données locales</span>
            </div>
            <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 