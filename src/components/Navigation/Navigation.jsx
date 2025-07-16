import React from 'react';
import { Calendar, BarChart3, Dumbbell } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Navigation = ({ activeTab, setActiveTab }) => {
  const { t } = useTranslation();
  const navItems = [
    { id: 'workout', icon: Dumbbell, label: t('workout_tab') },
    { id: 'calendar', icon: Calendar, label: t('calendar_tab') },
    { id: 'stats', icon: BarChart3, label: t('stats_tab') }
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="px-6">
        <div className="flex space-x-8">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`py-4 px-4 border-b-3 font-bold text-sm transition-all duration-200 ${
                activeTab === id
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
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