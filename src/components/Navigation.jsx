import React from 'react';
import { Calendar, BarChart3, Dumbbell } from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'workout', icon: Dumbbell, label: 'Séance' },
    { id: 'calendar', icon: Calendar, label: 'Calendrier' },
    { id: 'stats', icon: BarChart3, label: 'Statistiques' }
  ];

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="px-6">
        <div className="flex space-x-8">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`py-4 px-4 border-b-3 font-bold text-sm transition-all duration-200 ${
                activeTab === id
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
              } rounded-t-lg`}
            >
              <div className="flex items-center space-x-2">
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 